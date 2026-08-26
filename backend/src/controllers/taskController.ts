import { Response } from 'express';
import Task from '../models/Task';
import { AuthRequest } from '../middleware/auth';

/**
 * GET /api/tasks
 * Returns all tasks belonging to the authenticated user.
 * Supports optional query params: ?completed=true|false&priority=high&category=Work
 */
export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { completed, priority, category } = req.query;
    const filter: Record<string, unknown> = { user: req.user!._id };

    if (completed !== undefined) filter.completed = completed === 'true';
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    const tasks = await Task.find(filter).sort({ deadline: 1 });
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
  }
};

/**
 * POST /api/tasks
 * Creates a new task owned by the authenticated user.
 */
export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, dateTime, deadline, priority, category, timeOfDay } = req.body;

    if (!title || !dateTime || !deadline) {
      res.status(400).json({ message: 'Title, dateTime and deadline are required' });
      return;
    }

    const task = await Task.create({
      user: req.user!._id,
      title,
      description,
      dateTime,
      deadline,
      priority,
      category,
      timeOfDay,
    });

    res.status(201).json(task);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to create task', error: error.message });
  }
};

/**
 * PUT /api/tasks/:id
 * Updates any field of a task (title, description, date-time, deadline,
 * priority, category, timeOfDay, or completed status). Only the task's owner may edit it.
 */
export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user!._id });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    const allowedFields = [
      'title',
      'description',
      'dateTime',
      'deadline',
      'priority',
      'category',
      'timeOfDay',
      'completed',
    ] as const;

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        (task as any)[field] = req.body[field];
      }
    });

    await task.save();
    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to update task', error: error.message });
  }
};

/**
 * PATCH /api/tasks/:id/complete
 * Convenience endpoint to toggle a task's completed status.
 */
export const toggleComplete = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user!._id });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    task.completed = !task.completed;
    await task.save();
    res.status(200).json(task);
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to toggle task', error: error.message });
  }
};

/**
 * DELETE /api/tasks/:id
 * Deletes a task. Only the task's owner may delete it.
 */
export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user!._id });

    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json({ message: 'Task deleted', id: req.params.id });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to delete task', error: error.message });
  }
};
