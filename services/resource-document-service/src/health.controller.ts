import { Controller, Get } from '@nestjs/common';
import { HealthResponse } from '@odos/types';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      service: '@odos/resource-document-service',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '0.1.0',
    };
  }
}
