import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { ResourceType } from '../entities/resource.entity';

@Injectable()
export class YouTubeAdapter {
  private readonly logger = new Logger(YouTubeAdapter.name);
  private readonly API_URL = 'https://www.googleapis.com/youtube/v3/search';
  
  // Assumes API key is provided via env vars in production. 
  // We use a dummy fallback strictly for isolated tests if env var is missing,
  // but standard usage requires YOUTUBE_API_KEY.
  private readonly apiKey = process.env.YOUTUBE_API_KEY || 'DUMMY_KEY';

  constructor(private readonly httpService: HttpService) {}

  async search(query: string, maxResults: number = 5): Promise<any[]> {
    try {
      this.logger.debug(`Fetching YouTube results for query: ${query}`);
      const response = await lastValueFrom(
        this.httpService.get(this.API_URL, {
          params: {
            part: 'snippet',
            q: query,
            type: 'video',
            maxResults,
            key: this.apiKey,
          },
          timeout: 5000, // 5s timeout
        }),
      );

      const items = response.data?.items || [];
      return items.map((item: any) => ({
        type: ResourceType.YOUTUBE,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
        metadata: {
          channelTitle: item.snippet.channelTitle,
          publishTime: item.snippet.publishTime,
        },
      }));
    } catch (error: any) {
      this.logger.error(`YouTube API error for query "${query}": ${error.message}`);
      // Returning empty array instead of crashing allows fallback to cache or graceful degradation
      return []; 
    }
  }
}
