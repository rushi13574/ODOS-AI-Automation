import { Controller, Post, Get, Body, Query, Param, Headers, HttpCode, UnauthorizedException } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { TaskInput } from './dependency-resolver.service';
import { IsString, IsNotEmpty, IsArray, IsNumber, Min } from 'class-validator';

export class BaselineDto {
  @IsString()
  @IsNotEmpty()
  roadmapId!: string;

  @IsArray()
  tasks!: TaskInput[];
}

export class RecalculateDto {
  @IsString()
  @IsNotEmpty()
  roadmapId!: string;

  @IsArray()
  tasks!: TaskInput[];
}

export class CapacityDto {
  @IsNumber()
  @Min(1)
  dailyCapacityMinutes!: number;
}

@Controller('schedule')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}

  private checkUserId(userId?: string): string {
    if (!userId) {
      throw new UnauthorizedException('Missing user identity header');
    }
    return userId;
  }

  @Post('baseline')
  @HttpCode(201)
  async generateBaseline(
    @Headers('x-user-id') userId: string | undefined,
    @Body() body: BaselineDto,
  ) {
    const uid = this.checkUserId(userId);
    return this.schedulerService.generateBaseline(uid, body.roadmapId, body.tasks);
  }

  @Get('current')
  async getCurrentSchedule(
    @Headers('x-user-id') userId: string | undefined,
    @Query('roadmapId') roadmapId: string,
  ) {
    const uid = this.checkUserId(userId);
    return this.schedulerService.getCurrentSchedule(uid, roadmapId);
  }

  @Get('today')
  async getTodayTasks(
    @Headers('x-user-id') userId: string | undefined,
    @Query('roadmapId') roadmapId: string,
  ) {
    const uid = this.checkUserId(userId);
    return this.schedulerService.getTodayTasks(uid, roadmapId);
  }

  @Post('recalculate')
  @HttpCode(200)
  async recalculateSchedule(
    @Headers('x-user-id') userId: string | undefined,
    @Body() body: RecalculateDto,
  ) {
    const uid = this.checkUserId(userId);
    return this.schedulerService.recalculateSchedule(uid, body.roadmapId, body.tasks);
  }

  @Post('capacity')
  @HttpCode(200)
  async setCapacity(
    @Headers('x-user-id') userId: string | undefined,
    @Body() body: CapacityDto,
  ) {
    const uid = this.checkUserId(userId);
    return this.schedulerService.setCapacity(uid, body.dailyCapacityMinutes);
  }

  @Post('task/:id/complete')
  @HttpCode(200)
  async markTaskCompleted(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') taskId: string,
    @Body('roadmapId') roadmapId: string,
  ) {
    const uid = this.checkUserId(userId);
    return this.schedulerService.markTaskCompleted(uid, roadmapId, taskId);
  }
}
