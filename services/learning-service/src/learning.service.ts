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
    const savedGoal = await this.goalRepo.save(goal);
    const goalId = savedGoal.id;

    // Seed mock skill nodes to test skills graph & task updates
    const node1 = this.nodeRepo.create({
      learningGoalId: goalId,
      title: `Introduction to ${dto.skillName}`,
      description: `Basic fundamentals and key terms of ${dto.skillName}.`,
      difficulty: 'easy',
      estimatedMinutes: 45,
      type: 'learning',
      sequence: 1,
    });
    const savedNode1 = await this.nodeRepo.save(node1);

    const node2 = this.nodeRepo.create({
      learningGoalId: goalId,
      title: `Practical exercises in ${dto.skillName}`,
      description: `Hands-on training and practice labs for ${dto.skillName}.`,
      difficulty: 'medium',
      estimatedMinutes: 60,
      type: 'practice',
      sequence: 2,
    });
    const savedNode2 = await this.nodeRepo.save(node2);

    const node3 = this.nodeRepo.create({
      learningGoalId: goalId,
      title: `${dto.skillName} Final Assessment`,
      description: `Knowledge evaluation of ${dto.skillName} skills.`,
      difficulty: 'hard',
      estimatedMinutes: 30,
      type: 'assessment',
      sequence: 3,
    });
    const savedNode3 = await this.nodeRepo.save(node3);

    // Seed mock dependencies
    const dep1 = this.dependencyRepo.create({
      learningGoalId: goalId,
      fromSkillId: savedNode1.id,
      toSkillId: savedNode2.id,
    });
    await this.dependencyRepo.save(dep1);

    const dep2 = this.dependencyRepo.create({
      learningGoalId: goalId,
      fromSkillId: savedNode2.id,
      toSkillId: savedNode3.id,
    });
    await this.dependencyRepo.save(dep2);

    return savedGoal;
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

    // Delete associated resources
    await this.goalRepo.delete({ id: goalId });
    await this.nodeRepo.delete({ learningGoalId: goalId });
    await this.dependencyRepo.delete({ learningGoalId: goalId });
    await this.progressRepo.delete({ learningGoalId: goalId });

    return { success: true, message: `Learning goal ${goalId} and all associated items deleted` };
  }

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
    // 1. Locate the target node
    const node = await this.nodeRepo.findOne({ where: { id: taskId } });
    if (!node) {
      throw new NotFoundException(`Task/SkillNode ${taskId} not found`);
    }

    // 2. Verify caller ownership on parent goal
    await this.getAndVerifyGoal(node.learningGoalId, userId);

    // 3. Upsert task progress
    let progress = await this.progressRepo.findOne({ where: { taskId } });
    if (!progress) {
      progress = this.progressRepo.create({
        learningGoalId: node.learningGoalId,
        taskId,
      });
    }

    progress.status = dto.status;
    progress.actualMinutes = dto.actualMinutes;
    progress.completedAt = dto.status === 'completed' ? new Date() : undefined;

    return this.progressRepo.save(progress);
  }
}
