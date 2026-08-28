import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { RoadmapServiceClient } from '../clients/roadmap-service.client';
import { JwtAuthGuard } from '../guards/auth.guard';
import type { Request } from 'express';

@Controller('roadmaps')
@UseGuards(JwtAuthGuard)
export class RoadmapController {
  constructor(private readonly roadmapClient: RoadmapServiceClient) {}

  @Post('generate')
  async generateRoadmap(@Body() body: any, @Req() req: Request) {
    return this.roadmapClient.generateRoadmap(body, req);
  }

  @Get(':id')
  async getRoadmap(@Param('id') id: string, @Req() req: Request) {
    return this.roadmapClient.getRoadmap(id, req);
  }

  @Get(':id/baseline')
  async getBaselineRoadmap(@Param('id') id: string, @Req() req: Request) {
    return this.roadmapClient.getBaselineRoadmap(id, req);
  }
}
