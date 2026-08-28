import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OdosLogger } from '@odos/logger';
import { validateEnv, GatewayEnvSchema } from '@odos/validation';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  // 0. Explicitly load ROOT .env
  const rootEnvPath = path.resolve(__dirname, '../../../.env');
  if (fs.existsSync(rootEnvPath)) {
    dotenv.config({ path: rootEnvPath });
  } else {
    // Fallback just in case we are running differently
    const cwdEnvPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(cwdEnvPath)) {
      dotenv.config({ path: cwdEnvPath });
    } else {
      dotenv.config(); // default
    }
  }

  // Temporary diagnostic log
  console.log('[CONFIG] SUPABASE_URL loaded:', !!process.env.SUPABASE_URL);
  if (process.env.SUPABASE_URL) {
    try {
      const url = new URL(process.env.SUPABASE_URL);
      console.log('[CONFIG] SUPABASE_HOST:', url.host);
    } catch (e) {
      console.log('[CONFIG] SUPABASE_HOST: Invalid URL format');
    }
  }

  // 1. Validate configuration variables
  validateEnv(GatewayEnvSchema, process.env);

  const logger = new OdosLogger('API Gateway');
  const app = await NestFactory.create(AppModule, { logger });

  app.setGlobalPrefix('api/v1');
  
  // Enable CORS securely for development origins
  app.enableCors({
    origin: ['http://localhost:3000', 'http://192.168.1.6:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env['PORT'] || process.env['API_GATEWAY_PORT'] || 4000;
  await app.listen(port);
  logger.log(`Running on http://localhost:${port}`);
}

bootstrap();
