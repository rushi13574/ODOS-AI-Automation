import { Controller, Get, HttpCode } from '@nestjs/common';
import { HealthResponse } from '@odos/types';
import { DataSource } from 'typeorm';

@Controller()
export class HealthController {
  private readonly startTime = Date.now();

  constructor(private readonly dataSource: DataSource) {}

  @Get('health')
  @HttpCode(200)
  check(): HealthResponse {
    return {
      status: 'ok',
      service: '@odos/user-service',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '0.1.0',
    };
  }

  @Get('ready')
  @HttpCode(200)
  checkReady() {
    const isDbConnected = this.dataSource.isInitialized;
    if (!isDbConnected) {
      throw new Error('Database not connected');
    }
    return {
      status: 'ready',
      service: '@odos/user-service',
      db: 'connected',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '0.1.0',
    };
  }
}

