import { apiClient } from './client';
import { Task, TaskInput } from '../types';

export const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await apiClient.get<Task[]>('/tasks');
  return data;
};

export const createTaskRequest = async (input: TaskInput): Promise<Task> => {
  const { data } = await apiClient.post<Task>('/tasks', input);
  return data;
};

export const updateTaskRequest = async (
  id: string,
  input: Partial<TaskInput>
): Promise<Task> => {
  const { data } = await apiClient.put<Task>(`/tasks/${id}`, input);
  return data;
};

export const toggleTaskComplete = async (id: string): Promise<Task> => {
  const { data } = await apiClient.patch<Task>(`/tasks/${id}/complete`);
  return data;
};

export const deleteTaskRequest = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};
