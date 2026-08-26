export type Priority = 'high' | 'medium' | 'low';

export interface User {
  id: string;
  name: string;
  email: string;
}

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night' | 'Workload' | 'General';

export interface Task {
  _id: string;
  user: string;
  title: string;
  description?: string;
  dateTime: string; // ISO string
  deadline: string; // ISO string
  priority: Priority;
  completed: boolean;
  category?: string;
  timeOfDay?: TimeOfDay;
  createdAt: string;
  updatedAt: string;
}

// Payload shape used when creating/editing a task from the app
export interface TaskInput {
  title: string;
  description?: string;
  dateTime: string;
  deadline: string;
  priority: Priority;
  category?: string;
  timeOfDay?: TimeOfDay;
}

export type SortMode = 'smart' | 'deadline' | 'priority' | 'dateTime';
export type FilterMode = 'all' | 'active' | 'completed';
