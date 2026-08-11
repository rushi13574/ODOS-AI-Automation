import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum DocumentType {
  PDF = 'pdf',
  DOCX = 'docx',
  MD = 'md',
}

export enum DocumentStatus {
  PENDING = 'pending',
  UPLOADED = 'uploaded',
  EXPIRED = 'expired',
}

@Entity('generated_documents')
@Index(['userId', 'month'])
export class GeneratedDocument {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  documentId!: string;

  @Column()
  userId!: string;

  @Column()
  skillId!: string;

  @Column()
  title!: string;

  @Column({
    type: 'enum',
    enum: DocumentType
  })
  type!: DocumentType;

  @Column()
  version!: string;

  @Column()
  storageKey!: string;

  @Column()
  month!: string;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING
  })
  status!: DocumentStatus;

  @Column({ type: 'timestamp' })
  expiresAt!: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
