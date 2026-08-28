import { Injectable, Logger } from '@nestjs/common';
import { BaseServiceClient } from './base.client';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';

@Injectable()
export class AIServiceClient extends BaseServiceClient {
  protected readonly logger = new Logger(AIServiceClient.name);
  protected readonly baseUrl =
    process.env.AI_SERVICE_URL || 'http://localhost:4005';

  constructor(httpService: HttpService) {
    super(httpService);
  }

  async generateRoadmap(data: any, req: Request) {
    // Note: This endpoint is likely called internally by roadmap-service,
    // but exposing it directly on gateway if needed
    return this.post('/ai/roadmap', data, req, { timeout: 30000 });
  }

  async chat(data: any, req: Request) {
    return this.post('/ai/chat', data, req, { timeout: 15000 });
  }

  async explain(data: any, req: Request) {
    return this.post('/ai/explain', data, req, { timeout: 20000 });
  }

  async generateQuiz(data: any, req: Request) {
    return this.post('/ai/quiz', data, req, { timeout: 20000 });
  }

  async generateOnboardingQuestions(data: any, req: Request) {
    return this.post('/ai/onboarding-questions', data, req, { timeout: 25000 });
  }
}
