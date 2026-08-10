import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ _id: false })
export class Profile {
  @Prop({ type: String, default: '' })
  name!: string;

  @Prop({ type: String, required: true, unique: true })
  email!: string;

  @Prop({ type: String, default: '' })
  avatar!: string;

  @Prop({ type: String, default: '' })
  bio!: string;

  @Prop({ type: String, default: 'UTC' })
  timezone!: string;
}

@Schema({ _id: false })
export class Preferences {
  @Prop({ type: Number, default: 60 })
  dailyMinutes!: number;

  @Prop({ type: [String], default: [] })
  learningDays!: string[];

  @Prop({ type: String, default: 'visual' })
  learningStyle!: string;

  @Prop({ type: String, default: 'beginner' })
  currentLevel!: string;

  @Prop({ type: String, default: 'advanced' })
  targetLevel!: string;
}

@Schema({ _id: false })
export class AIPreferences {
  @Prop({ type: String, default: 'gemini' })
  provider!: string;

  @Prop({ type: String, default: 'gemini-1.5-pro' })
  model!: string;

  @Prop({ type: String, default: '' })
  encryptedApiKey!: string;

  @Prop({ type: String, default: 'unconfigured' })
  configurationStatus!: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true, unique: true, index: true })
  userId!: string; // Maps to Supabase UUID

  @Prop({ type: Profile, required: true })
  profile!: Profile;

  @Prop({ type: Preferences, default: () => ({}) })
  preferences!: Preferences;

  @Prop({ type: AIPreferences, default: () => ({}) })
  aiPreferences!: AIPreferences;
}

export const UserSchema = SchemaFactory.createForClass(User);
