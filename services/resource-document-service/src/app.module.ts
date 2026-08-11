import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health.controller';
import { ResourceModule } from './resource/resource.module';
import { DocumentModule } from './document/document.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/odos',
      autoLoadEntities: true,
      synchronize: true, // For development only
    }),
    ScheduleModule.forRoot(),
    ResourceModule,
    DocumentModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
