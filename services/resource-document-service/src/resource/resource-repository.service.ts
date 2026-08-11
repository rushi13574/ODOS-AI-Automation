import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Resource } from '../entities/resource.entity';

@Injectable()
export class ResourceRepository {
  private readonly logger = new Logger(ResourceRepository.name);

  constructor(
    @InjectRepository(Resource) private resourceRepo: Repository<Resource>,
  ) {}

  async saveResources(skillId: string, resources: Partial<Resource>[]): Promise<any[]> {
    const docs = resources.map(r => this.resourceRepo.create({
      ...r,
      skillId,
    }));
    
    try {
      return await this.resourceRepo.save(docs);
    } catch (err: any) {
      this.logger.error(`Failed to save resources for skillId ${skillId}: ${err.message}`);
      return [];
    }
  }

  async getResourcesBySkillId(skillId: string): Promise<Resource[]> {
    return this.resourceRepo.find({ where: { skillId } });
  }
}
