import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LearningGoal } from './entities/learning-goal.entity';
import { SkillNode } from './entities/skill-node.entity';
import { SkillDependency } from './entities/skill-dependency.entity';
import { TaskProgress } from './entities/task-progress.entity';
import { CreateLearningGoalDto, UpdateLearningGoalDto } from './dtos/learning-goal.dto';
import { UpdateTaskProgressDto } from './dtos/update-task-progress.dto';

@Injectable()
export class LearningService {
  constructor(
    @InjectRepository(LearningGoal) private readonly goalRepo: Repository<LearningGoal>,
    @InjectRepository(SkillNode) private readonly nodeRepo: Repository<SkillNode>,
    @InjectRepository(SkillDependency) private readonly dependencyRepo: Repository<SkillDependency>,
    @InjectRepository(TaskProgress) private readonly progressRepo: Repository<TaskProgress>
  ) {}

  /**
   * Helper to fetch a goal and assert user ownership.
   */
  async getAndVerifyGoal(goalId: string, userId: string): Promise<LearningGoal> {
    const goal = await this.goalRepo.findOne({ where: { id: goalId } });
    if (!goal) {
      throw new NotFoundException(`Learning goal ${goalId} not found`);
    }
    if (goal.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this learning goal');
    }
    return goal;
  }

  async createGoal(userId: string, dto: CreateLearningGoalDto): Promise<LearningGoal> {
    const goal = this.goalRepo.create({
      userId,
      skillName: dto.skillName,
      currentLevel: dto.currentLevel,
      targetLevel: dto.targetLevel,
      dailyMinutes: dto.dailyMinutes,
      learningDays: dto.learningDays,
      targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      learningReason: dto.learningReason || '',
      learningStyle: dto.learningStyle || 'visual',
      status: 'active',
    });
    return this.goalRepo.save(goal);
  }

  async getGoals(userId: string): Promise<LearningGoal[]> {
    return this.goalRepo.find({ 
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }

  async getGoalById(userId: string, goalId: string): Promise<LearningGoal> {
    return this.getAndVerifyGoal(goalId, userId);
  }

  async updateGoal(userId: string, goalId: string, dto: UpdateLearningGoalDto): Promise<LearningGoal> {
    const goal = await this.getAndVerifyGoal(goalId, userId);

    if (dto.skillName !== undefined) goal.skillName = dto.skillName;
    if (dto.currentLevel !== undefined) goal.currentLevel = dto.currentLevel;
    if (dto.targetLevel !== undefined) goal.targetLevel = dto.targetLevel;
    if (dto.dailyMinutes !== undefined) goal.dailyMinutes = dto.dailyMinutes;
    if (dto.learningDays !== undefined) goal.learningDays = dto.learningDays;
    if (dto.targetDate !== undefined) goal.targetDate = dto.targetDate ? new Date(dto.targetDate) : undefined;
    if (dto.learningReason !== undefined) goal.learningReason = dto.learningReason;
    if (dto.learningStyle !== undefined) goal.learningStyle = dto.learningStyle;
    if (dto.status !== undefined) goal.status = dto.status;

    return this.goalRepo.save(goal);
  }

  async deleteGoal(userId: string, goalId: string) {
    await this.getAndVerifyGoal(goalId, userId);

    // Delete progress records owned by this service
    await this.progressRepo.delete({ learningGoalId: goalId });
    // Clean up any legacy mock nodes (safe no-op if table is empty)
    await this.nodeRepo.delete({ learningGoalId: goalId });
    await this.dependencyRepo.delete({ learningGoalId: goalId });
    // Delete the goal itself
    await this.goalRepo.delete({ id: goalId });

    return { success: true, message: `Learning goal ${goalId} and all associated items deleted` };
  }

  /**
   * @deprecated Curriculum nodes now live in roadmap-service.
   * This endpoint returns legacy mock nodes for backward compatibility.
   * Frontend should use roadmap-service's GET /roadmaps/by-goal/:id instead.
   */
  async getSkills(userId: string, goalId: string) {
    await this.getAndVerifyGoal(goalId, userId);

    const [nodes, dependencies] = await Promise.all([
      this.nodeRepo.find({ 
        where: { learningGoalId: goalId },
        order: { sequence: 'ASC' }
      }),
      this.dependencyRepo.find({ where: { learningGoalId: goalId } }),
    ]);

    return { nodes, dependencies };
  }

  async getProgress(userId: string, goalId: string) {
    await this.getAndVerifyGoal(goalId, userId);
    return this.progressRepo.find({ where: { learningGoalId: goalId } });
  }

  async updateTaskProgress(userId: string, taskId: string, dto: UpdateTaskProgressDto): Promise<TaskProgress> {
    // 1. Verify caller ownership on the learning goal
    await this.getAndVerifyGoal(dto.learningGoalId, userId);

    // 2. Upsert task progress
    let progress = await this.progressRepo.findOne({ where: { taskId } });
    if (!progress) {
      progress = this.progressRepo.create({
        learningGoalId: dto.learningGoalId,
        taskId,
      });
    }

    progress.status = dto.status;
    progress.actualMinutes = dto.actualMinutes;
    progress.completedAt = dto.status === 'completed' ? new Date() : undefined;

    return this.progressRepo.save(progress);
  }
}
