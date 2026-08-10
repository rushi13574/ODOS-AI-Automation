import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TaskProgressDocument = TaskProgress & Document;

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
export class TaskProgress {
  @Prop({ type: String, required: true, index: true })
  learningGoalId!: string;

  @Prop({ type: String, required: true, unique: true, index: true })
  taskId!: string;

  @Prop({ type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' })
  status!: string;

  @Prop({ type: Date })
  completedAt?: Date;

  @Prop({ type: Number })
  actualMinutes?: number;
}

export const TaskProgressSchema = SchemaFactory.createForClass(TaskProgress);
