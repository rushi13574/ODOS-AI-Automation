import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { RoadmapModule } from './roadmap/roadmap.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odos',
      autoLoadEntities: true,
      synchronize: true, // For development only
    }),
    RoadmapModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
