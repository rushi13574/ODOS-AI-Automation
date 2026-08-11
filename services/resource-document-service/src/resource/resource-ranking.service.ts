import { Injectable } from '@nestjs/common';
import { Resource } from '../entities/resource.entity';

@Injectable()
export class ResourceRankingService {
  /**
   * Ranks resources deterministically based on available metadata and type weights.
   */
  rankResources(resources: Partial<Resource>[]): Partial<Resource>[] {
    // Basic MVP ranking: 
    // 1. Sort by a simple heuristic (e.g. if we have views, sort by views descending)
    // 2. If no views exist, keep original order (which is usually the search engine's relevance rank)
    
    return [...resources].sort((a, b) => {
      const viewsA = a.metadata?.views ? parseInt(a.metadata.views, 10) : 0;
      const viewsB = b.metadata?.views ? parseInt(b.metadata.views, 10) : 0;
      
      if (viewsA !== viewsB) {
        return viewsB - viewsA; // Descending
      }
      
      return 0; // Maintain original order if metadata is equivalent
    });
  }
}
