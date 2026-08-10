const fs = require('fs');
const path = require('path');

const services = [
  { name: 'user-service', port: 4001, label: 'User Service', isService: true },
  { name: 'learning-service', port: 4002, label: 'Learning Service', isService: true },
  { name: 'roadmap-service', port: 4003, label: 'Roadmap Service', isService: true },
  { name: 'scheduler-service', port: 4004, label: 'Scheduler Service', isService: true },
  { name: 'ai-service', port: 4005, label: 'AI Service', isService: true },
  { name: 'resource-document-service', port: 4006, label: 'Resource & Document Service', isService: true },
  { name: 'api-gateway', port: 4000, label: 'API Gateway', isService: false },
];

const nestCliJson = JSON.stringify({
  "$schema": "https://json.schemastore.org/nest-cli",
  collection: "@nestjs/schematics",
  sourceRoot: "src",
  compilerOptions: { deleteOutDir: true }
}, null, 2);

for (const svc of services) {
  const rootDir = svc.isService ? 'services' : 'apps';
  const dir = path.join(process.cwd(), rootDir, svc.name);
  const srcDir = path.join(dir, 'src');

  fs.mkdirSync(srcDir, { recursive: true });

  // package.json
  const pkg = {
    name: `@odos/${svc.name}`,
    version: "0.1.0",
    private: true,
    scripts: {
      build: "nest build",
      dev: "nest start --watch",
      start: "nest start",
      "start:prod": "node dist/main",
      lint: "eslint \"{src,apps,libs,test}/**/*.ts\"",
      clean: "rimraf dist"
    },
    dependencies: {
      "@nestjs/common": "^11.0.0",
      "@nestjs/core": "^11.0.0",
      "@nestjs/platform-express": "^11.0.0",
      "reflect-metadata": "^0.2.2",
      "rxjs": "^7.8.1",
      "class-validator": "^0.14.1",
      "class-transformer": "^0.5.1",
      "@odos/types": "workspace:*",
      "@odos/validation": "workspace:*",
      "@odos/logger": "workspace:*"
    },
    devDependencies: {
      "@nestjs/cli": "^11.0.0",
      "@types/express": "^5.0.0",
      "@types/node": "^22.20.1",
      "typescript": "^5.6.3",
      "eslint": "^9.0.0",
      "rimraf": "^6.0.1"
    }
  };

  const tsconfig = {
    extends: `../../packages/config/typescript/nestjs.json`,
    compilerOptions: {
      outDir: "./dist",
      rootDir: "./src",
      baseUrl: "./"
    },
    include: ["src"]
  };

  // Adjust relative extends path for apps (apps/api-gateway has same depth as services/user-service)
  fs.writeFileSync(path.join(dir, 'package.json'), JSON.stringify(pkg, null, 2));
  fs.writeFileSync(path.join(dir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));
  fs.writeFileSync(path.join(dir, 'nest-cli.json'), nestCliJson);

  // main.ts
  const envSchemaName = svc.name === 'api-gateway' ? 'GatewayEnvSchema' : 'CommonEnvSchema';
  const portEnv = svc.name.replace(/-/g, '_').toUpperCase() + '_PORT';
  
  const mainTs = `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { OdosLogger } from '@odos/logger';
import { validateEnv, ${envSchemaName} } from '@odos/validation';

async function bootstrap() {
  // 1. Validate configuration variables
  validateEnv(${envSchemaName}, process.env);

  const logger = new OdosLogger('${svc.label}');
  const app = await NestFactory.create(AppModule, { logger });

  ${!svc.isService ? "app.setGlobalPrefix('api/v1');" : ""}
  
  // Enable CORS
  app.enableCors();

  const port = process.env['PORT'] || process.env['${portEnv}'] || ${svc.port};
  await app.listen(port);
  logger.log(\`Running on http://localhost:\${port}\`);
}

bootstrap();
`;
  fs.writeFileSync(path.join(srcDir, 'main.ts'), mainTs);

  // app.module.ts
  const appModule = `import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
})
export class AppModule {}
`;
  fs.writeFileSync(path.join(srcDir, 'app.module.ts'), appModule);

  // health.controller.ts
  const healthTs = `import { Controller, Get } from '@nestjs/common';
import { HealthResponse } from '@odos/types';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  @Get()
  check(): HealthResponse {
    return {
      status: 'ok',
      service: '@odos/${svc.name}',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      version: '0.1.0',
    };
  }
}
`;
  fs.writeFileSync(path.join(srcDir, 'health.controller.ts'), healthTs);
}

console.log('API Gateway and 6 microservices scaffolded successfully!');
