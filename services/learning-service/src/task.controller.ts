import { Controller, Post, Body, Param, Headers, UnauthorizedException, HttpCode } from '@nestjs/common';
import { LearningService } from './learning.service';
import { UpdateTaskProgressDto } from './dtos/update-task-progress.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly learningService: LearningService) {}

  private checkUserId(userId?: string): string {
    if (!userId) {
      throw new UnauthorizedException('Missing user identity header');
    }
    return userId;
  }

  @Post(':id/progress')
  @HttpCode(200)
  async updateTaskProgress(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string,
    @Body() body: UpdateTaskProgressDto
  ) {
    const uid = this.checkUserId(userId);
    return this.learningService.updateTaskProgress(uid, id, body);
  }
}
