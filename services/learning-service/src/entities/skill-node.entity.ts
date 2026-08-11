import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('learning_skill_nodes')
export class SkillNode {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  learningGoalId!: string;

  @Column({ nullable: true })
  parentId?: string;

  @Column()
  title!: string;

  @Column({ default: '' })
  description!: string;

  @Column({ default: 'medium' })
  difficulty!: string;

  @Column()
  estimatedMinutes!: number;

  @Column()
  type!: string;

  @Column()
  sequence!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
