import { Injectable, Logger } from '@nestjs/common';
import { BaseServiceClient } from './base.client';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';

@Injectable()
export class RoadmapServiceClient extends BaseServiceClient {
  protected readonly logger = new Logger(RoadmapServiceClient.name);
  protected readonly baseUrl = process.env.ROADMAP_SERVICE_URL || 'http://localhost:4003';

  constructor(httpService: HttpService) {
    super(httpService);
  }

  async generateRoadmap(data: any, req: Request) {
    return this.post('/roadmaps/generate', data, req);
  }

  async getRoadmap(id: string, req: Request) {
    return this.get(`/roadmaps/${id}`, req);
  }

  async getBaselineRoadmap(id: string, req: Request) {
    return this.get(`/roadmaps/${id}/baseline`, req);
  }
}
