import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import helmet from 'helmet';
import { OdosLogger } from '@odos/logger';

async function bootstrap() {
  const logger = new OdosLogger('API Gateway');
  const app = await NestFactory.create(AppModule, { logger });

  // Security headers
  app.use(helmet());

  // Graceful shutdown
  app.enableShutdownHooks();

  // CORS configuration for production
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Apply the global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`Running on http://localhost:${port}`);
}
void bootstrap();
