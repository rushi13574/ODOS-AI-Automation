import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { GeneratedDocument, DocumentStatus } from '../entities/document.entity';
import { R2StorageAdapter } from './r2-storage.adapter';

@Injectable()
export class DocumentRetentionService {
  private readonly logger = new Logger(DocumentRetentionService.name);

  constructor(
    @InjectRepository(GeneratedDocument) private documentRepo: Repository<GeneratedDocument>,
    private readonly storageAdapter: R2StorageAdapter,
  ) {}

  // Run cleanup every hour
  @Cron(CronExpression.EVERY_HOUR)
  async handleRetentionCleanup() {
    this.logger.debug('Starting document retention cleanup...');
    const now = new Date();

    // Find documents where expiresAt is in the past and they are still UPLOADED
    const expiredDocs = await this.documentRepo.find({
      where: {
        expiresAt: LessThan(now),
        status: DocumentStatus.UPLOADED,
      }
    });

    if (expiredDocs.length === 0) {
      this.logger.debug('No expired documents found.');
      return;
    }

    for (const doc of expiredDocs) {
      try {
        await this.storageAdapter.deleteFile(doc.storageKey);
        doc.status = DocumentStatus.EXPIRED;
        await this.documentRepo.save(doc);
        this.logger.log(`Cleaned up expired document ${doc.documentId} from R2.`);
      } catch (err: any) {
        this.logger.error(`Failed to cleanup document ${doc.documentId}: ${err.message}`);
      }
    }
    
    this.logger.debug('Document retention cleanup finished.');
  }
}
