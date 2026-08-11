import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity('roadmap_tasks')
export class RoadmapTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  roadmapId!: string;

  @Column()
  skillNodeId!: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  status!: TaskStatus;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
