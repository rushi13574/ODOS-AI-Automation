import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { LearningServiceClient } from '../clients/learning-service.client';
import { JwtAuthGuard } from '../guards/auth.guard';
import type { Request } from 'express';

@Controller('learning')
@UseGuards(JwtAuthGuard)
export class LearningController {
  constructor(private readonly learningClient: LearningServiceClient) {}

  @Get('progress')
  async getProgress(@Req() req: Request) {
    return this.learningClient.getProgress(req);
  }
}
