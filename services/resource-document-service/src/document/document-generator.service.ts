import { Injectable, Logger, InternalServerErrorException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { format, addDays } from 'date-fns';
import { GeneratedDocument, DocumentType, DocumentStatus } from '../entities/document.entity';
import { R2StorageAdapter } from './r2-storage.adapter';
import { DocumentExporters } from './document-exporters';

export interface GenerateDocumentDto {
  userId: string;
  skillId: string;
  title: string;
  type: DocumentType;
  content: string; // The generated content from the AI Service
}

@Injectable()
export class DocumentGeneratorService {
  private readonly logger = new Logger(DocumentGeneratorService.name);

  constructor(
    @InjectRepository(GeneratedDocument) private documentRepo: Repository<GeneratedDocument>,
    private readonly storageAdapter: R2StorageAdapter,
    private readonly exporters: DocumentExporters,
  ) {}

  async generateDocument(dto: GenerateDocumentDto): Promise<GeneratedDocument> {
    const documentId = randomUUID();
    const version = 'v1';
    const month = format(new Date(), 'yyyy-MM');
    const storageKey = `docs/${dto.userId}/${dto.skillId}/${documentId}.${dto.type}`;
    // Expiration is exactly 7 days from now
    const expiresAt = addDays(new Date(), 7); 

    // Create DB entry as PENDING
    const newDoc = this.documentRepo.create({
      documentId,
      userId: dto.userId,
      skillId: dto.skillId,
      title: dto.title,
      type: dto.type,
      version,
      storageKey,
      month,
      expiresAt,
      status: DocumentStatus.PENDING,
    });
    
    await this.documentRepo.save(newDoc);

    let fileBuffer: Buffer;

    try {
      // 1. Generate Physical File
      switch (dto.type) {
        case DocumentType.PDF:
          fileBuffer = await this.exporters.exportPdf(dto.title, dto.content);
          break;
        case DocumentType.DOCX:
          fileBuffer = await this.exporters.exportDocx(dto.title, dto.content);
          break;
        case DocumentType.MD:
          fileBuffer = await this.exporters.exportMarkdown(dto.title, dto.content);
          break;
        default:
          throw new Error('Unsupported document type');
      }

      // 2. Upload to Cloudflare R2
      const contentType = this.getContentType(dto.type);
      await this.storageAdapter.uploadFile(storageKey, fileBuffer, contentType);

      // 3. Update Status to UPLOADED
      newDoc.status = DocumentStatus.UPLOADED;
      await this.documentRepo.save(newDoc);

      return newDoc;
    } catch (error: any) {
      this.logger.error(`Document generation failed for ${documentId}: ${error.message}`);
      throw new InternalServerErrorException('Failed to generate document');
    }
  }

  async getDownloadUrl(documentId: string, userId: string): Promise<string> {
    const doc = await this.documentRepo.findOne({ where: { documentId, userId } });
    if (!doc) throw new NotFoundException('Document not found');
    if (doc.status === DocumentStatus.EXPIRED) throw new BadRequestException('Document has expired and physical file is deleted');
    if (doc.status === DocumentStatus.PENDING) throw new BadRequestException('Document generation still pending');
    
    return this.storageAdapter.getPresignedDownloadUrl(doc.storageKey);
  }

  async getUserDocuments(userId: string, skillId?: string): Promise<GeneratedDocument[]> {
    const whereClause: any = { userId };
    if (skillId) {
      whereClause.skillId = skillId;
    }
    
    return this.documentRepo.find({ 
      where: whereClause,
      order: { createdAt: 'DESC' }
    });
  }

  async getDocumentDetails(documentId: string, userId: string): Promise<GeneratedDocument> {
    const doc = await this.documentRepo.findOne({ where: { documentId, userId } });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  private getContentType(type: DocumentType): string {
    switch (type) {
      case DocumentType.PDF: return 'application/pdf';
      case DocumentType.DOCX: return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case DocumentType.MD: return 'text/markdown';
      default: return 'application/octet-stream';
    }
  }
}
