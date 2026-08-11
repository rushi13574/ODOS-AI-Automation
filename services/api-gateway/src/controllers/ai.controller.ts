import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AIServiceClient } from '../clients/ai-service.client';
import { JwtAuthGuard } from '../guards/auth.guard';
import type { Request } from 'express';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AIController {
  constructor(private readonly aiClient: AIServiceClient) {}

  @Post('chat')
  async chat(@Body() body: any, @Req() req: Request) {
    return this.aiClient.chat(body, req);
  }

  @Post('explain')
  async explain(@Body() body: any, @Req() req: Request) {
    return this.aiClient.explain(body, req);
  }

  @Post('quiz')
  async generateQuiz(@Body() body: any, @Req() req: Request) {
    return this.aiClient.generateQuiz(body, req);
  }
}
