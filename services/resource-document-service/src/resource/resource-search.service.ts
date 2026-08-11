import { Injectable } from '@nestjs/common';
import { YouTubeAdapter } from './youtube.adapter';
import { ResourceCacheService } from './resource-cache.service';
import { ResourceRepository } from './resource-repository.service';
import { ResourceRankingService } from './resource-ranking.service';
import { Resource } from '../entities/resource.entity';

@Injectable()
export class ResourceSearchService {
  constructor(
    private readonly youtubeAdapter: YouTubeAdapter,
    private readonly resourceCache: ResourceCacheService,
    private readonly resourceRepo: ResourceRepository,
    private readonly rankingService: ResourceRankingService,
  ) {}

  async searchAndAggregate(skillId: string, query: string): Promise<Partial<Resource>[]> {
    const queryKey = `search:${skillId}:${query}`;
    
    // 1. Check Cache
    const cached = await this.resourceCache.getCachedResults(queryKey);
    if (cached) {
      return cached;
    }

    // 2. Fetch from External Providers (Currently YouTube)
    // In future, we can Promise.all() multiple adapters (e.g., articles, docs)
    const rawResults = await this.youtubeAdapter.search(query);

    // 3. Rank Results
    const rankedResults = this.rankingService.rankResources(rawResults);

    // 4. Update Cache
    await this.resourceCache.setCachedResults(queryKey, rankedResults);

    // 5. Persist to Repository for historical tracking / roadmap linking
    if (rankedResults.length > 0) {
      await this.resourceRepo.saveResources(skillId, rankedResults);
    }

    return rankedResults;
  }

  async getResourcesForSkill(skillId: string): Promise<Partial<Resource>[]> {
    return this.resourceRepo.getResourcesBySkillId(skillId);
  }
}
