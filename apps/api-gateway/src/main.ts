import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OdosLogger } from '@odos/logger';
import { validateEnv, GatewayEnvSchema } from '@odos/validation';

async function bootstrap() {
  // 1. Validate configuration variables
  validateEnv(GatewayEnvSchema, process.env);

  const logger = new OdosLogger('API Gateway');
  const app = await NestFactory.create(AppModule, { logger });

  app.setGlobalPrefix('api/v1');
  
  // Enable CORS
  app.enableCors();

  const port = process.env['PORT'] || process.env['API_GATEWAY_PORT'] || 4000;
  await app.listen(port);
  logger.log(`Running on http://localhost:${port}`);
}

bootstrap();
