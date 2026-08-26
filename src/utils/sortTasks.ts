import { Task, SortMode, Priority } from '../types';

// Lower weight = treated as more urgent. Expressed in "bonus hours" added to
// a task's deadline countdown, so a high-priority task effectively jumps the
// queue ahead of a same-deadline lower-priority one.
const PRIORITY_WEIGHT_HOURS: Record<Priority, number> = {
  high: 0,
  medium: 6,
  low: 14,
};

/**
 * "Smart" score used by the mixed sort algorithm.
 *
 * Combines three signals into a single urgency number (lower = more urgent):
 *  1. Hours remaining until the deadline (negative when overdue, which
 *     correctly makes overdue tasks the most urgent of all).
 *  2. A priority-based penalty, so a high-priority task is scheduled ahead
 *     of a medium/low task with a similar deadline.
 *  3. The scheduled dateTime as a lightweight tiebreaker, so among tasks with
 *     virtually identical urgency the one starting sooner comes first.
 */
export const smartUrgencyScore = (task: Task): number => {
  const hoursUntilDeadline = (new Date(task.deadline).getTime() - Date.now()) / 36e5;
  const priorityPenalty = PRIORITY_WEIGHT_HOURS[task.priority];
  const tiebreaker = new Date(task.dateTime).getTime() / 1e13; // tiny nudge, doesn't dominate

  return hoursUntilDeadline + priorityPenalty + tiebreaker;
};

const PRIORITY_ORDER: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

/**
 * Sorts tasks for display. Completed tasks always sink to the bottom
 * (still ordered by the chosen mode among themselves) so the active list
 * stays focused on what's left to do.
 */
export const sortTasks = (tasks: Task[], mode: SortMode = 'smart'): Task[] => {
  const compareByMode = (a: Task, b: Task): number => {
    switch (mode) {
      case 'deadline':
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      case 'dateTime':
        return new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime();
      case 'priority':
        return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
      case 'smart':
      default:
        return smartUrgencyScore(a) - smartUrgencyScore(b);
    }
  };

  return [...tasks].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return compareByMode(a, b);
  });
};
