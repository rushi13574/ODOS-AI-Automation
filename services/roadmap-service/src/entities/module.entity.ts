import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('modules')
export class Module {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  roadmapId!: string;

  @Column()
  title!: string;

  @Column()
  order!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
