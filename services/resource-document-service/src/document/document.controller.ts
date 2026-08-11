import { Controller, Post, Get, Body, Param, Headers, UnauthorizedException, HttpCode } from '@nestjs/common';
import { DocumentGeneratorService, GenerateDocumentDto } from './document-generator.service';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentGeneratorService) {}

  private checkUserId(userId?: string): string {
    if (!userId) {
      throw new UnauthorizedException('Missing user identity header');
    }
    return userId;
  }

  @Post('generate')
  @HttpCode(201)
  async generateDocument(
    @Headers('x-user-id') userId: string | undefined,
    @Body() body: Omit<GenerateDocumentDto, 'userId'>,
  ) {
    const uid = this.checkUserId(userId);
    return this.documentService.generateDocument({
      ...body,
      userId: uid,
    });
  }

  @Get()
  async getUserDocuments(@Headers('x-user-id') userId: string | undefined) {
    const uid = this.checkUserId(userId);
    return this.documentService.getUserDocuments(uid);
  }

  @Get(':id')
  async getDocumentDetails(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') documentId: string,
  ) {
    const uid = this.checkUserId(userId);
    return this.documentService.getDocumentDetails(documentId, uid);
  }

  @Get(':id/download')
  async getDownloadUrl(
    @Headers('x-user-id') userId: string | undefined,
    @Param('id') documentId: string,
  ) {
    const uid = this.checkUserId(userId);
    const url = await this.documentService.getDownloadUrl(documentId, uid);
    return { url };
  }
}
