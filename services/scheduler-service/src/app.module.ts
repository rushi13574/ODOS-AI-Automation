import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odos',
      autoLoadEntities: true,
      synchronize: true, // For development only
    }),
    SchedulerModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
