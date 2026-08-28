import { Injectable, BadGatewayException, Logger, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { TodayResponseDto, TaskDto, TodayMetricsDto, ResourceDto } from './dto/today.dto';

@Injectable()
export class TodayService {
  private readonly logger = new Logger(TodayService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  private async fetch<T>(url: string, userId: string, method: 'GET' | 'POST' = 'GET', data?: any): Promise<T> {
    this.logger.debug(`[TODAY] Fetching: ${url}`);
    try {
      const response = await firstValueFrom(
        this.httpService.request<T>({
          method,
          url,
          data,
          headers: {
            'x-user-id': userId,
          },
        }),
      );
      return response.data;
    } catch (error: any) {
      this.logger.error(`[TODAY] Failed to fetch ${url}: ${error.message}`);
      if (error.response) {
        throw new HttpException(
          `Downstream error at ${url}: ${error.response.status} ${JSON.stringify(error.response.data)}`,
          error.response.status
        );
      }
      throw new BadGatewayException(`Failed to connect to ${url}: ${error.message}`);
    }
  }

  async getTodayDashboard(userId: string, learningGoalId?: string): Promise<TodayResponseDto> {
    const learningUrl = this.configService.get<string>('LEARNING_SERVICE_URL');
    const roadmapUrl = this.configService.get<string>('ROADMAP_SERVICE_URL');
    const schedulerUrl = this.configService.get<string>('SCHEDULER_SERVICE_URL');
    const resourceUrl = this.configService.get<string>('RESOURCE_DOCUMENT_SERVICE_URL');

    // 1. Fetch user's learning goals from learning-service
    let goals: any[] = [];
    try {
      goals = await this.fetch<any[]>(`${learningUrl}/learning-goals`, userId);
    } catch (e) {
      throw new BadGatewayException('Failed to retrieve learning goals');
    }

    let activeGoals = goals.filter(g => g.status === 'active');
    
    if (learningGoalId) {
      activeGoals = activeGoals.filter(g => g.id === learningGoalId);
    }

    if (activeGoals.length === 0) {
      // Valid empty state — no active learning journey
      return {
        todayTasks: [],
        overdueTasks: [],
        metrics: null,
        objectives: [],
        resources: [],
        activeGoal: null,
        roadmap: null,
      };
    }

    // Find the first active goal that actually has a roadmap.
    // Many goals may be orphans from failed onboarding attempts.
    let activeGoal: any = null;
    let roadmapData: any = null;

    for (const candidate of activeGoals) {
      try {
        roadmapData = await this.fetch<any>(`${roadmapUrl}/roadmaps/by-goal/${candidate.id}`, userId);
        activeGoal = candidate;
        this.logger.debug(`[TODAY] Found roadmap for goal ${candidate.id} (${candidate.skillName})`);
        break;
      } catch (e: any) {
        if (e.getStatus && e.getStatus() === 404) {
          this.logger.debug(`[TODAY] No roadmap for goal ${candidate.id} (${candidate.skillName}), trying next...`);
          continue;
        }
        throw e; // Bubble non-404 errors
      }
    }

    if (!activeGoal || !roadmapData) {
      // No active goal has a roadmap yet
      return {
        todayTasks: [],
        overdueTasks: [],
        metrics: null,
        objectives: [],
        resources: [],
        activeGoal: activeGoals[0], // Return first goal for context even without roadmap
        roadmap: null,
      };
    }

    const goalId = activeGoal.id;

    // 3. Extract all SkillNodes from the roadmap's modules
    const allNodes: any[] = [];
    if (roadmapData.modules) {
      for (const mod of roadmapData.modules) {
        if (mod.skills) {
          for (const skill of mod.skills) {
            allNodes.push({ ...skill, moduleName: mod.title });
          }
        }
      }
    }

    // Helper to gracefully handle 404 as empty state, but bubble 500s
    const fetchOrEmpty = async <T>(url: string, defaultVal: T): Promise<T> => {
      try {
        return await this.fetch<T>(url, userId);
      } catch (e: any) {
        if (e.getStatus && e.getStatus() === 404) {
          return defaultVal;
        }
        throw e;
      }
    };

    // 4. Fetch progress and schedule data in parallel
    const [progressRes, todayScheduleRes, currentCalendarRes] = await Promise.all([
      fetchOrEmpty<any[]>(`${learningUrl}/learning-goals/${goalId}/progress`, []),
      fetchOrEmpty<any[]>(`${schedulerUrl}/schedule/today?roadmapId=${goalId}`, []),
      fetchOrEmpty<any>(`${schedulerUrl}/schedule/current?roadmapId=${goalId}`, { tasks: [] }),
    ]);

    // Build lookup maps
    const nodeMap = new Map<string, any>();
    allNodes.forEach(n => nodeMap.set(n.id, n));

    const progressMap = new Map<string, any>();
    progressRes.forEach(p => progressMap.set(p.taskId, p));

    // Helper to build TaskDto
    const buildTaskDto = (st: any): TaskDto => {
      const node = nodeMap.get(st.skillNodeId);
      const prog = progressMap.get(st.skillNodeId);
      return {
        id: st.skillNodeId,
        title: node?.title || 'Unknown Task',
        description: node?.description || '',
        status: prog?.status || 'pending',
        estimatedMinutes: st.estimatedMinutes || node?.estimatedMinutes || 0,
        completedMinutes: prog?.actualMinutes || 0,
        type: node?.learningType || node?.type || 'learning',
        moduleName: node?.moduleName || null,
      };
    };

    // 5. Build today tasks
    const todayTasks = todayScheduleRes.map(buildTaskDto);

    // 6. Build overdue tasks
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const overdueScheduleRes = (currentCalendarRes.tasks || []).filter((t: any) => {
      const taskDate = new Date(t.currentDate);
      return t.isCompleted === false && taskDate.getTime() < todayStart.getTime();
    });
    const overdueTasks = overdueScheduleRes.map(buildTaskDto);

    // 7. Build Metrics
    const estimatedTotalTime = allNodes.reduce((acc, n) => acc + (n.estimatedMinutes || 0), 0);
    const completedTime = progressRes.reduce((acc, p) => acc + (p.actualMinutes || 0), 0);
    const remainingTime = estimatedTotalTime > completedTime ? estimatedTotalTime - completedTime : 0;
    const progressPercentage = estimatedTotalTime > 0 ? (completedTime / estimatedTotalTime) * 100 : 0;

    // Find current module from the first non-completed node
    const currentNode = allNodes.find(n => {
      const prog = progressMap.get(n.id);
      return !prog || prog.status !== 'completed';
    });

    const metrics: TodayMetricsDto = {
      currentSkill: activeGoal.skillName,
      currentModule: currentNode?.moduleName || null,
      dayNumber: null,
      estimatedTotalTime,
      completedTime,
      remainingTime,
      progressPercentage,
      projectedCompletionDate: currentCalendarRes.currentProjectedCompletionDate || new Date().toISOString(),
      delayComparedToBaseline: currentCalendarRes.delayDays || 0,
    };

    // 8. Build Objectives from the first upcoming non-completed nodes
    const objectives = allNodes
      .filter(n => !progressMap.get(n.id) || progressMap.get(n.id).status !== 'completed')
      .slice(0, 3)
      .map(n => n.title);

    // 9. Resource Fetching (non-critical)
    let resources: ResourceDto[] = [];
    const currentTask = todayTasks.find(t => t.status === 'in_progress') || todayTasks.find(t => t.status === 'pending');

    if (currentTask) {
      try {
        const resQuery = encodeURIComponent(currentTask.title);
        const fetchedResources = await this.fetch<any[]>(`${resourceUrl}/resources/search?skillId=${currentTask.id}&q=${resQuery}`, userId);

        resources = fetchedResources.map(r => ({
          id: r.id,
          type: r.type,
          url: r.url,
          title: r.title,
          description: r.description,
          thumbnail: r.thumbnail,
        }));
      } catch (e) {
        this.logger.warn(`[TODAY] Failed to fetch resources for task ${currentTask.id}: ${e}`);
        resources = [];
      }
    }

    return {
      todayTasks,
      overdueTasks,
      metrics,
      objectives,
      resources,
      activeGoal,
      roadmap: roadmapData,
    };
  }
}
