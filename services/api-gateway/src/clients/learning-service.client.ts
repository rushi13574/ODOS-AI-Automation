import { Injectable, Logger } from '@nestjs/common';
import { BaseServiceClient } from './base.client';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';

@Injectable()
export class LearningServiceClient extends BaseServiceClient {
  protected readonly logger = new Logger(LearningServiceClient.name);
  protected readonly baseUrl =
    process.env.LEARNING_SERVICE_URL || 'http://localhost:4002';

  constructor(httpService: HttpService) {
    super(httpService);
  }

  async getProgress(req: Request) {
    return this.get('/learning/progress', req);
  }
}
