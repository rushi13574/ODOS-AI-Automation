import { Controller, Get, Query, Param, HttpCode, BadRequestException } from '@nestjs/common';
import { ResourceSearchService } from './resource-search.service';

@Controller('resources')
export class ResourceController {
  constructor(private readonly resourceSearchService: ResourceSearchService) {}

  @Get('search')
  @HttpCode(200)
  async searchResources(
    @Query('skillId') skillId: string,
    @Query('q') query: string,
  ) {
    if (!skillId || !query) {
      throw new BadRequestException('skillId and q query parameters are required');
    }
    return this.resourceSearchService.searchAndAggregate(skillId, query);
  }

  @Get('skill/:skillId')
  @HttpCode(200)
  async getResourcesBySkill(@Param('skillId') skillId: string) {
    return this.resourceSearchService.getResourcesForSkill(skillId);
  }
}
