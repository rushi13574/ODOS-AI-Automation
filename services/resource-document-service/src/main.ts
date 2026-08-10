import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OdosLogger } from '@odos/logger';
import { validateEnv, CommonEnvSchema } from '@odos/validation';

async function bootstrap() {
  // 1. Validate configuration variables
  validateEnv(CommonEnvSchema, process.env);

  const logger = new OdosLogger('Resource & Document Service');
  const app = await NestFactory.create(AppModule, { logger });

  
  
  // Enable CORS
  app.enableCors();

  const port = process.env['PORT'] || process.env['RESOURCE_DOCUMENT_SERVICE_PORT'] || 4006;
  await app.listen(port);
  logger.log(`Running on http://localhost:${port}`);
}

bootstrap();
