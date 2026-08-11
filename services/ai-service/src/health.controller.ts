import { Controller, Get, HttpCode } from '@nestjs/common';
import { HealthResponse } from '@odos/types';

@Controller()
export class HealthController {
  private readonly startTime = Date.now();

  @Get('health')
  @HttpCode(200)
  check(): HealthResponse {
    return {
      status: 'ok',
      service: '@odos/ai-service',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '0.1.0',
    };
  }

  @Get('ready')
  @HttpCode(200)
  checkReady() {
    return {
      status: 'ready',
      service: '@odos/ai-service',
      db: 'not-required',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '0.1.0',
    };
  }
}
