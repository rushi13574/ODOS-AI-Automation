import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { SchedulerServiceClient } from '../clients/scheduler-service.client';
import { JwtAuthGuard } from '../guards/auth.guard';
import type { Request } from 'express';

@Controller('schedule')
@UseGuards(JwtAuthGuard)
export class SchedulerController {
  constructor(private readonly schedulerClient: SchedulerServiceClient) {}

  @Get('calendar/:roadmapId')
  async getCalendar(
    @Param('roadmapId') roadmapId: string,
    @Req() req: Request,
  ) {
    return this.schedulerClient.getCalendar(roadmapId, req);
  }
}
