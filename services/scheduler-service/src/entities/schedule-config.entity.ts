import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('schedule_configs')
export class ScheduleConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  userId!: string;

  @Column({ default: 60 })
  dailyCapacityMinutes!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
