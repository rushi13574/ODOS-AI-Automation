import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('skill_nodes')
export class SkillNode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  roadmapId!: string;

  @Column()
  moduleId!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column('jsonb', { default: [] })
  objectives!: string[];

  @Column()
  difficulty!: string;

  @Column()
  estimatedMinutes!: number;

  @Column()
  learningType!: string;

  @Column('jsonb', { default: [] })
  practice!: string[];

  @Column('jsonb', { default: [] })
  assessment!: string[];

  @Column('jsonb', { default: [] })
  projects!: string[];

  @Column()
  order!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
