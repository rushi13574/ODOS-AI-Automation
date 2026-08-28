import { Injectable, Logger } from '@nestjs/common';
import { BaseServiceClient } from './base.client';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';

@Injectable()
export class UserServiceClient extends BaseServiceClient {
  protected readonly logger = new Logger(UserServiceClient.name);
  protected readonly baseUrl =
    process.env.USER_SERVICE_URL || 'http://localhost:4001';

  constructor(httpService: HttpService) {
    super(httpService);
  }

  async getProfile(req: Request) {
    return this.get('/profile', req);
  }
}
