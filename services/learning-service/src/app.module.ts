import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LearningGoalController } from './learning-goal.controller';
import { TaskController } from './task.controller';
import { HealthController } from './health.controller';
import { LearningService } from './learning.service';

// Entities
import { LearningGoal } from './entities/learning-goal.entity';
import { SkillNode } from './entities/skill-node.entity';
import { SkillDependency } from './entities/skill-dependency.entity';
import { TaskProgress } from './entities/task-progress.entity';

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
    TypeOrmModule.forFeature([
      LearningGoal,
      SkillNode,
      SkillDependency,
      TaskProgress,
    ]),
  ],
  controllers: [LearningGoalController, TaskController, HealthController],
  providers: [LearningService],
})
export class AppModule {}
