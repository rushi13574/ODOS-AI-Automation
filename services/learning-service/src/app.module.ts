import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LearningGoalController } from './learning-goal.controller';
import { TaskController } from './task.controller';
import { HealthController } from './health.controller';
import { LearningService } from './learning.service';

// Schemas
import { LearningGoal, LearningGoalSchema } from './schemas/learning-goal.schema';
import { SkillNode, SkillNodeSchema } from './schemas/skill-node.schema';
import { SkillDependency, SkillDependencySchema } from './schemas/skill-dependency.schema';
import { TaskProgress, TaskProgressSchema } from './schemas/task-progress.schema';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/odos_learning'),
    MongooseModule.forFeature([
      { name: LearningGoal.name, schema: LearningGoalSchema },
      { name: SkillNode.name, schema: SkillNodeSchema },
      { name: SkillDependency.name, schema: SkillDependencySchema },
      { name: TaskProgress.name, schema: TaskProgressSchema },
    ]),
  ],
  controllers: [LearningGoalController, TaskController, HealthController],
  providers: [LearningService],
})
export class AppModule {}
