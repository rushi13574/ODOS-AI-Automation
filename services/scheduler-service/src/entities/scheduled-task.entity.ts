import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('scheduled_tasks')
@Index(['userId', 'roadmapId', 'currentDate'])
export class ScheduledTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  roadmapId!: string;

  @Column()
  userId!: string;

  @Column()
  skillNodeId!: string;

  @Column()
  estimatedMinutes!: number;

  @Column({ type: 'simple-array', default: '' })
  prerequisiteSkillNodeIds!: string[];

  @Column({ type: 'timestamp' })
  baselineDate!: Date;

  @Column({ type: 'timestamp' })
  currentDate!: Date;

  @Column({ type: 'timestamp', nullable: true })
  actualCompletionDate?: Date;

  @Column({ default: false })
  isCompleted!: boolean;

  @Column({ default: false })
  isOverdue!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
