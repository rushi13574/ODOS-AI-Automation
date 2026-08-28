import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum RoadmapType {
  BASELINE = 'BASELINE',
  ADAPTIVE = 'ADAPTIVE',
}

@Entity('roadmaps')
export class Roadmap {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column({ nullable: true })
  learningGoalId?: string;

  @Column()
  targetSkill!: string;

  @Column('text')
  originalPrompt!: string;

  @Column({
    type: 'enum',
    enum: RoadmapType,
    default: RoadmapType.BASELINE
  })
  type!: RoadmapType;

  @Column({ default: 1 })
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
