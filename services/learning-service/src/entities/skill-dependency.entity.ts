import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('skill_dependencies')
export class SkillDependency {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  learningGoalId!: string;

  @Column()
  fromSkillId!: string;

  @Column()
  toSkillId!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
