import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';

import { Roadmap, RoadmapType } from '../entities/roadmap.entity';
import { Module } from '../entities/module.entity';
import { SkillNode } from '../entities/skill-node.entity';
import { Prerequisite } from '../entities/prerequisite.entity';
import { AiClientService } from '../ai/ai-client.service';

@Injectable()
export class RoadmapService {
  constructor(
    @InjectRepository(Roadmap) private roadmapRepo: Repository<Roadmap>,
    @InjectRepository(Module) private moduleRepo: Repository<Module>,
    @InjectRepository(SkillNode) private skillNodeRepo: Repository<SkillNode>,
    @InjectRepository(Prerequisite) private prerequisiteRepo: Repository<Prerequisite>,
    private readonly aiClientService: AiClientService,
  ) {}

  async generateRoadmap(userId: string, prompt: string, correlationId?: string): Promise<Roadmap> {
    const traceId = correlationId || crypto.randomUUID();
    
    // 1. Fetch AI response
    const aiResponse = await this.aiClientService.generateRoadmap(userId, prompt, traceId);

    // 2. Create Roadmap entity
    const roadmap = this.roadmapRepo.create({
      userId,
      originalPrompt: prompt,
      targetSkill: aiResponse.skill,
      type: RoadmapType.BASELINE,
      version: 1,
    });
    const savedRoadmap = await this.roadmapRepo.save(roadmap);

    const skillNodeIdMap = new Map<string, string>();
    const prerequisiteLinks: { targetId: string; requiredTitles: string[] }[] = [];

    let moduleOrder = 0;
    let skillOrder = 0;

    // 3. Create Modules and SkillNodes
    for (const modData of aiResponse.modules) {
      moduleOrder++;
      const mod = this.moduleRepo.create({
        roadmapId: savedRoadmap.id,
        title: modData.title,
        order: moduleOrder,
      });
      const savedModule = await this.moduleRepo.save(mod);

      for (const skillData of modData.skills) {
        skillOrder++;
        const skill = this.skillNodeRepo.create({
          roadmapId: savedRoadmap.id,
          moduleId: savedModule.id,
          title: skillData.title,
          description: skillData.description,
          objectives: skillData.objectives,
          difficulty: skillData.difficulty,
          estimatedMinutes: skillData.estimatedMinutes,
          learningType: skillData.learningType,
          practice: skillData.practice,
          assessment: skillData.assessment,
          projects: skillData.projects,
          order: skillOrder,
        });
        const savedSkill = await this.skillNodeRepo.save(skill);
        
        // Track ID for prerequisite mapping
        skillNodeIdMap.set(savedSkill.title.toLowerCase(), savedSkill.id);

        if (skillData.prerequisites && skillData.prerequisites.length > 0) {
          prerequisiteLinks.push({
            targetId: savedSkill.id,
            requiredTitles: skillData.prerequisites,
          });
        }
      }
    }

    // 4. Create Prerequisites
    for (const link of prerequisiteLinks) {
      for (const reqTitle of link.requiredTitles) {
        const requiredId = skillNodeIdMap.get(reqTitle.toLowerCase());
        if (requiredId) {
          const prereq = this.prerequisiteRepo.create({
            roadmapId: savedRoadmap.id,
            targetSkillNodeId: link.targetId,
            requiredSkillNodeId: requiredId,
          });
          await this.prerequisiteRepo.save(prereq);
        }
      }
    }

    return savedRoadmap;
  }

  async getRoadmapById(userId: string, id: string): Promise<any> {
    const roadmap = await this.roadmapRepo.findOne({ where: { id, userId } });
    if (!roadmap) {
      throw new NotFoundException(`Roadmap with id ${id} not found`);
    }

    const modules = await this.moduleRepo.find({ 
      where: { roadmapId: roadmap.id },
      order: { order: 'ASC' }
    });
    const skills = await this.skillNodeRepo.find({ 
      where: { roadmapId: roadmap.id },
      order: { order: 'ASC' }
    });
    const prerequisites = await this.prerequisiteRepo.find({ 
      where: { roadmapId: roadmap.id } 
    });

    // Map skills to modules
    const modulesWithSkills = modules.map(m => {
      return {
        ...m,
        skills: skills.filter(s => s.moduleId === m.id),
      };
    });

    return {
      ...roadmap,
      modules: modulesWithSkills,
      prerequisites,
    };
  }

  async getBaselineRoadmap(userId: string, id: string): Promise<any> {
    // For now, baseline is just the initial version (we only have baseline implemented).
    const roadmap = await this.roadmapRepo.findOne({ where: { id, userId } });
    if (!roadmap) {
      throw new NotFoundException(`Roadmap with id ${id} not found`);
    }
    
    let baselineRoadmap = roadmap;
    if (roadmap.type !== RoadmapType.BASELINE) {
      baselineRoadmap = await this.roadmapRepo.findOne({ 
        where: {
          userId: roadmap.userId, 
          targetSkill: roadmap.targetSkill,
          type: RoadmapType.BASELINE 
        }
      }) || roadmap;
    }

    return this.getRoadmapById(userId, baselineRoadmap.id);
  }
}
