import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScheduledTask } from '../entities/scheduled-task.entity';
import { ScheduleConfig } from '../entities/schedule-config.entity';
import { TaskInput } from './dependency-resolver.service';
import { SchedulingEngine } from './scheduling-engine.service';
import { Rescheduler } from './rescheduler.service';
import { CalendarComparator } from './calendar-comparator.service';
import { startOfDay } from 'date-fns';

@Injectable()
export class SchedulerService {
  constructor(
    @InjectRepository(ScheduledTask) private scheduledTaskRepo: Repository<ScheduledTask>,
    @InjectRepository(ScheduleConfig) private scheduleConfigRepo: Repository<ScheduleConfig>,
    private readonly schedulingEngine: SchedulingEngine,
    private readonly rescheduler: Rescheduler,
    private readonly calendarComparator: CalendarComparator,
  ) {}

  /**
   * Generates the immutable BASELINE calendar from the original roadmap.
   * If a baseline already exists for this roadmap, it deletes it and recreates (or throws).
   */
  async generateBaseline(userId: string, roadmapId: string, tasks: TaskInput[]): Promise<ScheduledTask[]> {
    let config = await this.scheduleConfigRepo.findOne({ where: { userId } });
    if (!config) {
      config = this.scheduleConfigRepo.create({ userId, dailyCapacityMinutes: 60 });
      config = await this.scheduleConfigRepo.save(config);
    }

    const today = startOfDay(new Date());
    
    // Engine generates deterministic dates based on inputs
    const scheduleResults = this.schedulingEngine.generateSchedule(tasks, today, config.dailyCapacityMinutes);

    // Wipe existing tasks for this roadmap if generating fresh baseline
    await this.scheduledTaskRepo.delete({ roadmapId, userId });

    const taskDocs = scheduleResults.map(r => this.scheduledTaskRepo.create({
      roadmapId,
      userId,
      skillNodeId: r.skillNodeId,
      estimatedMinutes: r.estimatedMinutes,
      baselineDate: r.assignedDate,
      currentDate: r.assignedDate, // Initially, current = baseline
      isCompleted: false,
    }));

    return this.scheduledTaskRepo.save(taskDocs);
  }

  async getCurrentSchedule(userId: string, roadmapId: string): Promise<any> {
    const tasks = await this.scheduledTaskRepo.find({ where: { userId, roadmapId } });
    const comparison = this.calendarComparator.compare(tasks);

    return {
      tasks,
      ...comparison,
    };
  }

  async getTodayTasks(userId: string, roadmapId: string): Promise<ScheduledTask[]> {
    const today = startOfDay(new Date());
    return this.scheduledTaskRepo.find({ 
      where: {
        userId, 
        roadmapId, 
        currentDate: today, 
        isCompleted: false 
      }
    });
  }

  /**
   * Recalculates the current calendar based on missed tasks or capacity changes.
   */
  async recalculateSchedule(userId: string, roadmapId: string, taskInputs: TaskInput[]): Promise<any> {
    const config = await this.scheduleConfigRepo.findOne({ where: { userId } });
    const capacity = config ? config.dailyCapacityMinutes : 60;

    const tasks = await this.scheduledTaskRepo.find({ where: { userId, roadmapId } });
    if (!tasks || tasks.length === 0) {
      throw new NotFoundException('No schedule found for this roadmap');
    }

    const rescheduledData = this.rescheduler.recalculateCurrentSchedule(tasks, taskInputs, capacity);

    const tasksToSave = [];
    for (const r of rescheduledData) {
      const t = tasks.find(t => t.skillNodeId === r.skillNodeId);
      if (t) {
        t.currentDate = r.newCurrentDate;
        tasksToSave.push(t);
      }
    }

    if (tasksToSave.length > 0) {
      await this.scheduledTaskRepo.save(tasksToSave);
    }

    return this.getCurrentSchedule(userId, roadmapId);
  }

  async setCapacity(userId: string, dailyCapacityMinutes: number): Promise<ScheduleConfig> {
    let config = await this.scheduleConfigRepo.findOne({ where: { userId } });
    if (config) {
      config.dailyCapacityMinutes = dailyCapacityMinutes;
      await this.scheduleConfigRepo.save(config);
    } else {
      config = this.scheduleConfigRepo.create({ userId, dailyCapacityMinutes });
      await this.scheduleConfigRepo.save(config);
    }
    return config;
  }

  async markTaskCompleted(userId: string, roadmapId: string, taskId: string): Promise<ScheduledTask> {
    const task = await this.scheduledTaskRepo.findOne({ where: { id: taskId, userId, roadmapId } });
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    task.isCompleted = true;
    task.actualCompletionDate = new Date();
    return this.scheduledTaskRepo.save(task);
  }
}
