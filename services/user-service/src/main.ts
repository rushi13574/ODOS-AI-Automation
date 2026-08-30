import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OdosLogger } from '@odos/logger';
import { validateEnv, CommonEnvSchema } from '@odos/validation';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const rootEnvPath = path.resolve(__dirname, '../../../.env');
  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
  } else {
    dotenv.config();
  }

  // Validate configuration variables
  validateEnv(CommonEnvSchema, process.env);

  const logger = new OdosLogger('User Service');
  const app = await NestFactory.create(AppModule, { logger });

  // Enable global validation pipe
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Graceful shutdown
  app.enableShutdownHooks();

  // Internal microservice CORS restriction (Gateway handles public CORS)
  app.enableCors({ origin: false });

  const port = Number(process.env.PORT) || 4001;
  await app.listen(port);
  logger.log(`Running on http://localhost:${port}`);
}

bootstrap();
