import { Injectable, Logger } from '@nestjs/common';
import { BaseServiceClient } from './base.client';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';

@Injectable()
export class SchedulerServiceClient extends BaseServiceClient {
  protected readonly logger = new Logger(SchedulerServiceClient.name);
  protected readonly baseUrl = process.env.SCHEDULER_SERVICE_URL || 'http://localhost:4004';

  constructor(httpService: HttpService) {
    super(httpService);
  }

  async getCalendar(roadmapId: string, req: Request) {
    return this.get(`/schedule/calendar/${roadmapId}`, req);
  }
}
