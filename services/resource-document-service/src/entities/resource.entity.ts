import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum ResourceType {
  YOUTUBE = 'youtube',
  DOCUMENTATION = 'documentation',
  ARTICLE = 'article',
  PRACTICE = 'practice',
  PROJECT = 'project',
}

@Entity('resources')
@Index(['skillId'])
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  skillId!: string;

  @Column({
    type: 'enum',
    enum: ResourceType
  })
  type!: ResourceType;

  @Column()
  url!: string;

  @Column()
  title!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  thumbnail?: string;

  @Column('jsonb', { nullable: true })
  metadata?: Record<string, any>;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
