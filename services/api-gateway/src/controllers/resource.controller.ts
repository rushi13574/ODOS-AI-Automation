import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ResourceDocumentServiceClient } from '../clients/resource-document-service.client';
import { JwtAuthGuard } from '../guards/auth.guard';
import type { Request } from 'express';

@Controller()
@UseGuards(JwtAuthGuard)
export class ResourceDocumentController {
  constructor(private readonly resourceClient: ResourceDocumentServiceClient) {}

  @Get('resources/search')
  async searchResources(@Query('query') query: string, @Req() req: Request) {
    return this.resourceClient.searchResources(query, req);
  }

  @Get('resources/skill/:skillId')
  async getSkillResources(
    @Param('skillId') skillId: string,
    @Req() req: Request,
  ) {
    return this.resourceClient.getSkillResources(skillId, req);
  }

  @Post('documents/generate')
  async generateDocument(@Body() body: any, @Req() req: Request) {
    return this.resourceClient.generateDocument(body, req);
  }

  @Get('documents')
  async getDocuments(@Req() req: Request) {
    return this.resourceClient.getDocuments(req);
  }

  @Get('documents/:id')
  async getDocumentDetails(@Param('id') id: string, @Req() req: Request) {
    return this.resourceClient.getDocumentDetails(id, req);
  }

  @Get('documents/:id/download')
  async getDocumentDownloadUrl(@Param('id') id: string, @Req() req: Request) {
    return this.resourceClient.getDocumentDownloadUrl(id, req);
  }
}
