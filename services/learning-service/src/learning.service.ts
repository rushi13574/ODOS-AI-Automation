import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearningGoal, LearningGoalDocument } from './schemas/learning-goal.schema';
import { SkillNode, SkillNodeDocument } from './schemas/skill-node.schema';
import { SkillDependency, SkillDependencyDocument } from './schemas/skill-dependency.schema';
import { TaskProgress, TaskProgressDocument } from './schemas/task-progress.schema';
import { CreateLearningGoalDto, UpdateLearningGoalDto } from './dtos/learning-goal.dto';
import { UpdateTaskProgressDto } from './dtos/update-task-progress.dto';

@Injectable()
export class LearningService {
  constructor(
    @InjectModel(LearningGoal.name) private readonly goalModel: Model<LearningGoalDocument>,
    @InjectModel(SkillNode.name) private readonly nodeModel: Model<SkillNodeDocument>,
    @InjectModel(SkillDependency.name) private readonly dependencyModel: Model<SkillDependencyDocument>,
    @InjectModel(TaskProgress.name) private readonly progressModel: Model<TaskProgressDocument>
  ) {}

  /**
   * Helper to fetch a goal and assert user ownership.
   */
  async getAndVerifyGoal(goalId: string, userId: string): Promise<LearningGoalDocument> {
    const goal = await this.goalModel.findById(goalId);
    if (!goal) {
      throw new NotFoundException(`Learning goal ${goalId} not found`);
    }
    if (goal.userId !== userId) {
      throw new ForbiddenException('Access denied: You do not own this learning goal');
    }
    return goal;
  }

  async createGoal(userId: string, dto: CreateLearningGoalDto): Promise<LearningGoal> {
    const goal = await this.goalModel.create({
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

    const goalId = goal._id.toString();

    // Seed mock skill nodes to test skills graph & task updates
    const node1: any = await this.nodeModel.create({
      learningGoalId: goalId,
      title: `Introduction to ${dto.skillName}`,
      description: `Basic fundamentals and key terms of ${dto.skillName}.`,
      difficulty: 'easy',
      estimatedMinutes: 45,
      type: 'learning',
      sequence: 1,
    });

    const node2: any = await this.nodeModel.create({
      learningGoalId: goalId,
      title: `Practical exercises in ${dto.skillName}`,
      description: `Hands-on training and practice labs for ${dto.skillName}.`,
      difficulty: 'medium',
      estimatedMinutes: 60,
      type: 'practice',
      sequence: 2,
    });

    const node3: any = await this.nodeModel.create({
      learningGoalId: goalId,
      title: `${dto.skillName} Final Assessment`,
      description: `Knowledge evaluation of ${dto.skillName} skills.`,
      difficulty: 'hard',
      estimatedMinutes: 30,
      type: 'assessment',
      sequence: 3,
    });

    // Seed mock dependencies
    await this.dependencyModel.create({
      learningGoalId: goalId,
      fromSkillId: node1._id.toString(),
      toSkillId: node2._id.toString(),
    });

    await this.dependencyModel.create({
      learningGoalId: goalId,
      fromSkillId: node2._id.toString(),
      toSkillId: node3._id.toString(),
    });

    return goal;
  }

  async getGoals(userId: string): Promise<LearningGoal[]> {
    return this.goalModel.find({ userId }).sort({ createdAt: -1 });
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

    return goal.save();
  }

  async deleteGoal(userId: string, goalId: string) {
    await this.getAndVerifyGoal(goalId, userId);

    // Delete associated resources
    await this.goalModel.findByIdAndDelete(goalId);
    await this.nodeModel.deleteMany({ learningGoalId: goalId });
    await this.dependencyModel.deleteMany({ learningGoalId: goalId });
    await this.progressModel.deleteMany({ learningGoalId: goalId });

    return { success: true, message: `Learning goal ${goalId} and all associated items deleted` };
  }

  async getSkills(userId: string, goalId: string) {
    await this.getAndVerifyGoal(goalId, userId);

    const [nodes, dependencies] = await Promise.all([
      this.nodeModel.find({ learningGoalId: goalId }).sort({ sequence: 1 }),
      this.dependencyModel.find({ learningGoalId: goalId }),
    ]);

    return { nodes, dependencies };
  }

  async getProgress(userId: string, goalId: string) {
    await this.getAndVerifyGoal(goalId, userId);
    return this.progressModel.find({ learningGoalId: goalId });
  }

  async updateTaskProgress(userId: string, taskId: string, dto: UpdateTaskProgressDto): Promise<TaskProgress> {
    // 1. Locate the target node
    const node = await this.nodeModel.findById(taskId);
    if (!node) {
      throw new NotFoundException(`Task/SkillNode ${taskId} not found`);
    }

    // 2. Verify caller ownership on parent goal
    await this.getAndVerifyGoal(node.learningGoalId, userId);

    // 3. Upsert task progress
    let progress = await this.progressModel.findOne({ taskId });
    if (!progress) {
      progress = new this.progressModel({
        learningGoalId: node.learningGoalId,
        taskId,
      });
    }

    progress.status = dto.status;
    progress.actualMinutes = dto.actualMinutes;
    progress.completedAt = dto.status === 'completed' ? new Date() : undefined;

    return progress.save();
  }
}
