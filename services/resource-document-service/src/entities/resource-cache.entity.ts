import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('resource_caches')
export class ResourceCache {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  queryKey!: string;

  @Column('jsonb')
  results!: any[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
