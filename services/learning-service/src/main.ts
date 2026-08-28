import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OdosLogger } from '@odos/logger';
import { validateEnv, CommonEnvSchema } from '@odos/validation';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Validate configuration variables
  validateEnv(CommonEnvSchema, process.env);

  const logger = new OdosLogger('Learning Service');
  const app = await NestFactory.create(AppModule, { logger });

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  
  // Graceful shutdown
  app.enableShutdownHooks();

  // Internal microservice CORS restriction (Gateway handles public CORS)
  app.enableCors({ origin: false });

  const port = process.env.LEARNING_SERVICE_PORT || 4002;
  await app.listen(port);
  logger.log(`Running on http://localhost:${port}`);
}

bootstrap();
