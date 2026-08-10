import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { LearningService } from './learning.service';
import { CreateLearningGoalDto, UpdateLearningGoalDto } from './dtos/learning-goal.dto';

@Controller('learning-goals')
export class LearningGoalController {
  constructor(private readonly learningService: LearningService) {}

  private checkUserId(userId?: string): string {
    if (!userId) {
      throw new UnauthorizedException('Missing user identity header');
    }
    return userId;
  }

  @Post()
  async createGoal(@Headers('x-user-id') userId: string | undefined, @Body() body: CreateLearningGoalDto) {
    const uid = this.checkUserId(userId);
    return this.learningService.createGoal(uid, body);
  }

  @Get()
  async getGoals(@Headers('x-user-id') userId?: string) {
    const uid = this.checkUserId(userId);
    return this.learningService.getGoals(uid);
  }

  @Get(':id')
  async getGoalById(@Headers('x-user-id') userId: string | undefined, @Param('id') id: string) {
    const uid = this.checkUserId(userId);
    return this.learningService.getGoalById(uid, id);
  }

  @Patch(':id')
  async updateGoal(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string,
    @Body() body: UpdateLearningGoalDto
  ) {
    const uid = this.checkUserId(userId);
    return this.learningService.updateGoal(uid, id, body);
  }

  @Delete(':id')
  async deleteGoal(@Headers('x-user-id') userId: string | undefined, @Param('id') id: string) {
    const uid = this.checkUserId(userId);
    return this.learningService.deleteGoal(uid, id);
  }

  @Get(':id/skills')
  async getSkills(@Headers('x-user-id') userId: string | undefined, @Param('id') id: string) {
    const uid = this.checkUserId(userId);
    return this.learningService.getSkills(uid, id);
  }

  @Get(':id/progress')
  async getProgress(@Headers('x-user-id') userId: string | undefined, @Param('id') id: string) {
    const uid = this.checkUserId(userId);
    return this.learningService.getProgress(uid, id);
  }
}
