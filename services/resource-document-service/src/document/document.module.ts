import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentController } from './document.controller';
import { DocumentGeneratorService } from './document-generator.service';
import { DocumentRetentionService } from './document-retention.service';
import { R2StorageAdapter } from './r2-storage.adapter';
import { DocumentExporters } from './document-exporters';
import { GeneratedDocument } from '../entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GeneratedDocument,
    ]),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentGeneratorService,
    DocumentRetentionService,
    R2StorageAdapter,
    DocumentExporters,
  ],
  exports: [DocumentGeneratorService],
})
export class DocumentModule {}
