import { Injectable, Logger } from '@nestjs/common';
import { BaseServiceClient } from './base.client';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';

@Injectable()
export class ResourceDocumentServiceClient extends BaseServiceClient {
  protected readonly logger = new Logger(ResourceDocumentServiceClient.name);
  protected readonly baseUrl =
    process.env.RESOURCE_SERVICE_URL || 'http://localhost:4006';

  constructor(httpService: HttpService) {
    super(httpService);
  }

  async searchResources(query: string, req: Request) {
    return this.get(
      `/resources/search?query=${encodeURIComponent(query)}`,
      req,
    );
  }

  async getSkillResources(skillId: string, req: Request) {
    return this.get(`/resources/skill/${skillId}`, req);
  }

  async generateDocument(data: any, req: Request) {
    return this.post('/documents/generate', data, req, { timeout: 30000 });
  }

  async getDocuments(req: Request) {
    return this.get('/documents', req);
  }

  async getDocumentDetails(id: string, req: Request) {
    return this.get(`/documents/${id}`, req);
  }

  async getDocumentDownloadUrl(id: string, req: Request) {
    return this.get(`/documents/${id}/download`, req);
  }
}
