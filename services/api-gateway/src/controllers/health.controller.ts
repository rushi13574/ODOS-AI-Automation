import { Controller, Get, HttpCode } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get('health')
  @HttpCode(200)
  checkHealth() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  @HttpCode(200)
  checkReady() {
    return {
      status: 'ready',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
    };
  }
}
