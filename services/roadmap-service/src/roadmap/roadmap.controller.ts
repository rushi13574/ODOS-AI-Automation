import { Controller, Post, Get, Body, Param, Headers, HttpCode, UnauthorizedException } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { RoadmapService } from './roadmap.service';

export class GenerateRoadmapDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;

  @IsString()
  @IsNotEmpty()
  learningGoalId!: string;
}

@Controller('roadmaps')
export class RoadmapController {
  constructor(private readonly roadmapService: RoadmapService) {}

  private checkUserId(userId?: string): string {
    if (!userId) {
      throw new UnauthorizedException('Missing user identity header');
    }
    return userId;
  }

  @Post('generate')
  @HttpCode(201)
  async generateRoadmap(
    @Headers('x-user-id') userId: string | undefined,
    @Headers('x-correlation-id') correlationId: string | undefined,
    @Body() body: GenerateRoadmapDto,
  ) {
    const uid = this.checkUserId(userId);
    return this.roadmapService.generateRoadmap(uid, body.prompt, body.learningGoalId, correlationId);
  }

  @Get(':id')
  async getRoadmap(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string
  ) {
    const uid = this.checkUserId(userId);
    return this.roadmapService.getRoadmapById(uid, id);
  }

  @Get('by-goal/:learningGoalId')
  async getRoadmapByGoal(
    @Headers('x-user-id') userId: string | undefined,
    @Param('learningGoalId') learningGoalId: string
  ) {
    const uid = this.checkUserId(userId);
    return this.roadmapService.getRoadmapByGoal(uid, learningGoalId);
  }

  @Get(':id/baseline')
  async getBaselineRoadmap(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') id: string
  ) {
    const uid = this.checkUserId(userId);
    return this.roadmapService.getBaselineRoadmap(uid, id);
  }
}

