import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthController } from './health.controller';
import { ResourceModule } from './resource/resource.module';
import { DocumentModule } from './document/document.module';

const isProd = process.env.NODE_ENV === 'production';
const dbUrl = process.env.DATABASE_URL;
if (isProd && !dbUrl) {
  throw new Error('DATABASE_URL environment variable is strictly required in production.');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: dbUrl || 'postgresql://postgres:postgres@localhost:5432/odos',
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
