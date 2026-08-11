import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { AiClientService } from '../ai/ai-client.service';
import { Roadmap } from '../entities/roadmap.entity';
import { Module as RoadmapModuleEntity } from '../entities/module.entity';
import { SkillNode } from '../entities/skill-node.entity';
import { Prerequisite } from '../entities/prerequisite.entity';
import { RoadmapTask } from '../entities/roadmap-task.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Roadmap,
      RoadmapModuleEntity,
      SkillNode,
      Prerequisite,
      RoadmapTask,
    ]),
  ],
  controllers: [RoadmapController],
  providers: [RoadmapService, AiClientService],
  exports: [RoadmapService],
})
export class RoadmapModule {}
