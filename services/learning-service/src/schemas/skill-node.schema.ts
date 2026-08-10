import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SkillNodeDocument = SkillNode & Document;

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
export class SkillNode {
  @Prop({ type: String, required: true, index: true })
  learningGoalId!: string;

  @Prop({ type: String, default: null })
  parentId?: string;

  @Prop({ type: String, required: true })
  title!: string;

  @Prop({ type: String, default: '' })
  description!: string;

  @Prop({ type: String, default: 'medium' })
  difficulty!: string;

  @Prop({ type: Number, required: true })
  estimatedMinutes!: number;

  @Prop({ type: String, enum: ['learning', 'practice', 'assessment', 'project', 'review'], required: true })
  type!: string;

  @Prop({ type: Number, required: true })
  sequence!: number;
}

export const SkillNodeSchema = SchemaFactory.createForClass(SkillNode);
