import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('prerequisites')
export class Prerequisite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  roadmapId!: string;

  @Column()
  targetSkillNodeId!: string;

  @Column()
  requiredSkillNodeId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
