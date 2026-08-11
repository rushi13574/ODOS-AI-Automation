import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface Profile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  timezone: string;
}

export interface Preferences {
  dailyMinutes: number;
  learningDays: string[];
  learningStyle: string;
  currentLevel: string;
  targetLevel: string;
}

export interface AIPreferences {
  provider: string;
  model: string;
  encryptedApiKey: string;
  configurationStatus: string;
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', unique: true })
  userId!: string; // Maps to Supabase UUID

  @Column({ type: 'jsonb', default: {} })
  profile!: Profile;

  @Column({ type: 'jsonb', default: {} })
  preferences!: Preferences;

  @Column({ type: 'jsonb', default: {} })
  aiPreferences!: AIPreferences;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
