import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ResourceController } from './resource.controller';
import { ResourceSearchService } from './resource-search.service';
import { YouTubeAdapter } from './youtube.adapter';
import { ResourceCacheService } from './resource-cache.service';
import { ResourceRepository } from './resource-repository.service';
import { ResourceRankingService } from './resource-ranking.service';
import { Resource } from '../entities/resource.entity';
import { ResourceCache } from '../entities/resource-cache.entity';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([
      Resource,
      ResourceCache,
    ]),
  ],
  controllers: [ResourceController],
  providers: [
    ResourceSearchService,
    YouTubeAdapter,
    ResourceCacheService,
    ResourceRepository,
    ResourceRankingService,
  ],
  exports: [ResourceSearchService],
})
export class ResourceModule {}
