import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SkillDependencyDocument = SkillDependency & Document;

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
export class SkillDependency {
  @Prop({ type: String, required: true, index: true })
  learningGoalId!: string;

  @Prop({ type: String, required: true })
  fromSkillId!: string;

  @Prop({ type: String, required: true })
  toSkillId!: string;
}

export const SkillDependencySchema = SchemaFactory.createForClass(SkillDependency);
