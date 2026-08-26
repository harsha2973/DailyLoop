import { Schema, model, Document, Types } from 'mongoose';

export type Priority = 'high' | 'medium' | 'low';

export interface ITask extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  dateTime: Date; // when the task is scheduled/starts
  deadline: Date; // hard due date/time
  priority: Priority;
  completed: boolean;
  category?: string;
  timeOfDay?: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    dateTime: {
      type: Date,
      required: [true, 'Date-time is required'],
    },
    deadline: {
      type: Date,
      required: [true, 'Deadline is required'],
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      trim: true,
      default: 'General',
    },
    timeOfDay: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Helpful compound index for the common "my tasks, soonest deadline first" query
taskSchema.index({ user: 1, deadline: 1 });

export default model<ITask>('Task', taskSchema);
