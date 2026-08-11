import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('learning_goals')
export class LearningGoal {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  skillName!: string;

  @Column()
  currentLevel!: string;

  @Column()
  targetLevel!: string;

  @Column()
  dailyMinutes!: number;

  @Column('jsonb')
  learningDays!: string[];

  @Column({ type: 'timestamp', nullable: true })
  targetDate?: Date;

  @Column({ default: '' })
  learningReason!: string;

  @Column({ default: 'visual' })
  learningStyle!: string;

  @Column({ default: 'active' })
  status!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
