import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LearningGoalDocument = LearningGoal & Document;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: any) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class LearningGoal {
  @Prop({ type: String, required: true, index: true })
  userId!: string;

  @Prop({ type: String, required: true })
  skillName!: string;

  @Prop({ type: String, required: true })
  currentLevel!: string;

  @Prop({ type: String, required: true })
  targetLevel!: string;

  @Prop({ type: Number, required: true })
  dailyMinutes!: number;

  @Prop({ type: [String], required: true })
  learningDays!: string[];

  @Prop({ type: Date })
  targetDate?: Date;

  @Prop({ type: String, default: '' })
  learningReason!: string;

  @Prop({ type: String, default: 'visual' })
  learningStyle!: string;

  @Prop({ type: String, enum: ['active', 'completed', 'abandoned'], default: 'active' })
  status!: string;
}

export const LearningGoalSchema = SchemaFactory.createForClass(LearningGoal);
