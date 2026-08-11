import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('task_progress')
export class TaskProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  learningGoalId!: string;

  @Column({ unique: true })
  taskId!: string;

  @Column({ default: 'not_started' })
  status!: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ nullable: true })
  actualMinutes?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
