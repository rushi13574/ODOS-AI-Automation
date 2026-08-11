import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ResourceCache } from '../entities/resource-cache.entity';

@Injectable()
export class ResourceCacheService {
  private readonly logger = new Logger(ResourceCacheService.name);

  constructor(
    @InjectRepository(ResourceCache) private cacheRepo: Repository<ResourceCache>,
  ) {}

  async getCachedResults(queryKey: string): Promise<any[] | null> {
    const cached = await this.cacheRepo.findOne({ where: { queryKey } });
    if (cached) {
      // Check for 24h expiration
      const now = new Date();
      const diff = now.getTime() - cached.createdAt.getTime();
      if (diff > 86400000) {
        this.logger.debug(`Cache expired for queryKey: ${queryKey}`);
        await this.cacheRepo.delete({ id: cached.id });
        return null;
      }

      this.logger.debug(`Cache hit for queryKey: ${queryKey}`);
      return cached.results;
    }
    this.logger.debug(`Cache miss for queryKey: ${queryKey}`);
    return null;
  }

  async setCachedResults(queryKey: string, results: any[]): Promise<void> {
    try {
      let cached = await this.cacheRepo.findOne({ where: { queryKey } });
      if (cached) {
        cached.results = results;
        cached.createdAt = new Date(); // Reset expiration
        await this.cacheRepo.save(cached);
      } else {
        cached = this.cacheRepo.create({ queryKey, results });
        await this.cacheRepo.save(cached);
      }
    } catch (err: any) {
      this.logger.error(`Failed to cache results for queryKey ${queryKey}: ${err.message}`);
    }
  }
}
