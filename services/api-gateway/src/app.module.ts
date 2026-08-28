import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { CorrelationIdMiddleware } from './middleware/correlation-id.middleware';

// Clients
import { UserServiceClient } from './clients/user-service.client';
import { LearningServiceClient } from './clients/learning-service.client';
import { RoadmapServiceClient } from './clients/roadmap-service.client';
import { SchedulerServiceClient } from './clients/scheduler-service.client';
import { AIServiceClient } from './clients/ai-service.client';
import { ResourceDocumentServiceClient } from './clients/resource-document-service.client';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { LearningController } from './controllers/learning.controller';
import { RoadmapController } from './controllers/roadmap.controller';
import { SchedulerController } from './controllers/scheduler.controller';
import { AIController } from './controllers/ai.controller';
import { ResourceDocumentController } from './controllers/resource.controller';
import { HealthController } from './controllers/health.controller';

@Module({
  imports: [
    HttpModule,
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100, // 100 requests per minute
      },
    ]),
  ],
  controllers: [
    AuthController,
    LearningController,
    RoadmapController,
    SchedulerController,
    AIController,
    ResourceDocumentController,
    HealthController,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    UserServiceClient,
    LearningServiceClient,
    RoadmapServiceClient,
    SchedulerServiceClient,
    AIServiceClient,
    ResourceDocumentServiceClient,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CorrelationIdMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
