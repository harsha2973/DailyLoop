import { NativeModules, Platform, PermissionsAndroid, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';

const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';
const NOTIFIED_TASKS_KEY = 'notified_task_ids';

export const formatTaskReminderMessage = (rawTitle: string): string => {
  if (!rawTitle || !rawTitle.trim()) {
    return "It's time for your task!";
  }

  const title = rawTitle.trim();
  const lower = title.toLowerCase();

  // Normalize if title already starts with "it's time to" or "time to" / "time for"
  if (lower.startsWith("it's time to ") || lower.startsWith("it is time to ")) {
    return `It's time to ${title.slice(title.indexOf("to ") + 3)}`;
  }
  if (lower.startsWith("time to ")) {
    return `It's time to ${title.slice(8)}`;
  }
  if (lower.startsWith("time for ")) {
    return `It's time for ${title.slice(9)}`;
  }

  const firstWord = lower.split(' ')[0];

  // Specific noun starters
  const nounStarters = new Set(['meeting', 'appointment', 'session', 'class', 'interview', 'workout']);
  if (nounStarters.has(firstWord)) {
    const formatted = title.charAt(0).toLowerCase() + title.slice(1);
    if (lower.startsWith('a ') || lower.startsWith('an ') || lower.startsWith('the ') || lower.startsWith('your ')) {
      return `It's time for ${formatted}`;
    }
    return `It's time for your ${formatted}`;
  }

  const commonVerbs = new Set([
    'cook', 'finish', 'prepare', 'go', 'do', 'make', 'take', 'clean', 'wash',
    'study', 'read', 'write', 'complete', 'work', 'buy', 'send', 'email',
    'pay', 'review', 'check', 'submit', 'organize', 'fix', 'update', 'design',
    'build', 'create', 'attend', 'schedule', 'book', 'pick', 'drop',
    'start', 'run', 'walk', 'exercise', 'drink', 'eat', 'order', 'setup', 'set',
    'practice', 'learn', 'plan', 'water', 'feed', 'iron', 'fold', 'cut', 'get',
    'shop', 'bring', 'fetch', 'call', 'talk', 'chat', 'discuss'
  ]);

  const isFirstWordVerb = commonVerbs.has(firstWord) || (firstWord.endsWith('ing') && !nounStarters.has(firstWord));

  if (isFirstWordVerb) {
    const formattedTitle = title.charAt(0).toLowerCase() + title.slice(1);
    return `It's time to ${formattedTitle}`;
  }

  const nounTitle = title.charAt(0).toLowerCase() + title.slice(1);
  if (lower.startsWith('a ') || lower.startsWith('an ') || lower.startsWith('the ') || lower.startsWith('your ') || lower.startsWith('my ')) {
    return `It's time for ${nounTitle}`;
  }

  return `It's time for your ${nounTitle}`;
};

export class NotificationService {
  private static timerId: any = null;
  private static activeNotificationCallback: ((task: Task) => void) | null = null;
  private static tasksGetter: (() => Task[]) | null = null;

  static async requestPermission(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn('Failed to request notification permission:', err);
        return false;
      }
    }
    return true;
  }

  static async isEnabled(): Promise<boolean> {
    try {
      const val = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      return val === null ? true : JSON.parse(val);
    } catch {
      return true;
    }
  }

  static async setEnabled(enabled: boolean): Promise<void> {
    try {
      if (enabled) {
        await this.requestPermission();
      }
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, JSON.stringify(enabled));
    } catch (e) {
      console.error('Failed to set notification status:', e);
    }
  }

  static setCallback(callback: ((task: Task) => void) | null) {
    this.activeNotificationCallback = callback;
  }

  static async resetNotifiedTasks(): Promise<void> {
    await AsyncStorage.removeItem(NOTIFIED_TASKS_KEY);
  }

  static registerTaskCompletionListener(onComplete: (taskId: string) => void) {
    // 1. Process any pending tasks marked complete while app was closed/in background
    if (Platform.OS === 'android' && NativeModules.NativeNotificationModule?.getPendingCompletedTasks) {
      NativeModules.NativeNotificationModule.getPendingCompletedTasks()
        .then((ids: string[]) => {
          if (ids && ids.length > 0) {
            ids.forEach((id) => onComplete(id));
          }
        })
        .catch(() => {});
    }

    // 2. Listen to real-time clicks on "Mark as Complete" button on Android notification cards
    const sub = DeviceEventEmitter.addListener(
      'onTaskCompletedFromNotification',
      (data: { taskId: string }) => {
        if (data && data.taskId) {
          onComplete(data.taskId);
        }
      }
    );

    return () => sub.remove();
  }

  /**
   * Schedules background alarms using Android's native AlarmManager.
   * Runs even when the app is completely closed or killed!
   */
  static scheduleNativeBackgroundAlarms(task: Task) {
    if (Platform.OS !== 'android' || !NativeModules.NativeNotificationModule?.scheduleAlarm || task.completed) {
      return;
    }

    const nowMs = Date.now();

    const getAlarmId = (taskId: string, stage: number): number => {
      let hash = 0;
      const str = `${taskId}_stage_${stage}`;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
      }
      return Math.abs(hash) % 10000000;
    };

    // Stage 1: Scheduled Time Arrival (dateTime) -> No Mark as Complete button
    if (task.dateTime) {
      const scheduledMs = new Date(task.dateTime).getTime();
      if (!isNaN(scheduledMs) && scheduledMs > nowMs) {
        const title = 'Task Reminder';
        const body = formatTaskReminderMessage(task.title);
        const alarmId = getAlarmId(task._id, 1);
        NativeModules.NativeNotificationModule.scheduleAlarm(title, body, scheduledMs, task._id, false, alarmId);
      }
    }

    // Stage 2 & 3: Deadline Approaching (1 min before) & Deadline Reached
    if (task.deadline) {
      const deadlineMs = new Date(task.deadline).getTime();
      if (!isNaN(deadlineMs)) {
        // Stage 2: Deadline Approaching (1 minute before deadline) -> No Mark as Complete button
        const approachingMs = deadlineMs - 1 * 60 * 1000;
        if (approachingMs > nowMs) {
          const title = 'Deadline Approaching';
          const body = `"${task.title}" deadline is in 1 minute.`;
          const alarmId = getAlarmId(task._id, 2);
          NativeModules.NativeNotificationModule.scheduleAlarm(title, body, approachingMs, task._id, false, alarmId);
        }

        // Stage 3: Deadline Reached (Exact deadline time) -> WITH "Mark as Complete" button!
        if (deadlineMs > nowMs) {
          const title = 'Deadline Reached!';
          const body = `"${task.title}" deadline has arrived.`;
          const alarmId = getAlarmId(task._id, 3);
          NativeModules.NativeNotificationModule.scheduleAlarm(title, body, deadlineMs, task._id, true, alarmId);
        }
      }
    }
  }

  static triggerNativeSystemNotification(
    title: string,
    body: string,
    taskId: string,
    showCompleteAction: boolean
  ) {
    if (Platform.OS === 'android' && NativeModules.NativeNotificationModule) {
      let hash = 0;
      for (let i = 0; i < taskId.length; i++) {
        hash = (hash << 5) - hash + taskId.charCodeAt(i);
        hash |= 0;
      }
      const notificationId = Math.abs(hash) % 10000000;
      NativeModules.NativeNotificationModule.showNotification(
        title,
        body,
        notificationId,
        taskId,
        showCompleteAction
      );
    }
  }

  /**
   * Real-time in-app checker + background alarm sync.
   */
  static async checkTasks(tasks: Task[]) {
    const enabled = await this.isEnabled();
    if (!enabled || !tasks || tasks.length === 0) return;

    // Schedule background alarms for all active tasks
    tasks.forEach((t) => this.scheduleNativeBackgroundAlarms(t));

    const now = new Date();
    let notifiedIdsRaw = await AsyncStorage.getItem(NOTIFIED_TASKS_KEY);
    let notifiedIds: string[] = notifiedIdsRaw ? JSON.parse(notifiedIdsRaw) : [];

    for (const task of tasks) {
      if (task.completed) continue;

      // Rule 1: Scheduled Time Arrival (dateTime)
      if (task.dateTime) {
        const scheduledDate = new Date(task.dateTime);
        if (!isNaN(scheduledDate.getTime())) {
          const scheduledDiffMs = now.getTime() - scheduledDate.getTime();
          const scheduledKey = `${task._id}_scheduled_${task.dateTime}`;

          if (scheduledDiffMs >= 0 && scheduledDiffMs <= 15 * 60 * 1000 && !notifiedIds.includes(scheduledKey)) {
            notifiedIds.push(scheduledKey);
            await AsyncStorage.setItem(NOTIFIED_TASKS_KEY, JSON.stringify(notifiedIds));

            const title = 'Task Reminder';
            const body = formatTaskReminderMessage(task.title);

            this.triggerNativeSystemNotification(title, body, task._id, false);

            if (this.activeNotificationCallback) {
              this.activeNotificationCallback(task);
            }
          }
        }
      }

      // Rule 2 & 3: Deadline Approaching & Deadline Reached
      if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        if (!isNaN(deadlineDate.getTime())) {
          // Rule 2: Deadline Approaching (1 minute before deadline)
          const approachingDate = new Date(deadlineDate.getTime() - 1 * 60 * 1000);
          const approachingDiffMs = now.getTime() - approachingDate.getTime();
          const approachingKey = `${task._id}_approaching_${task.deadline}`;

          if (approachingDiffMs >= 0 && approachingDiffMs <= 15 * 60 * 1000 && !notifiedIds.includes(approachingKey)) {
            notifiedIds.push(approachingKey);
            await AsyncStorage.setItem(NOTIFIED_TASKS_KEY, JSON.stringify(notifiedIds));

            const title = 'Deadline Approaching';
            const body = `"${task.title}" deadline is in 1 minute.`;

            this.triggerNativeSystemNotification(title, body, task._id + '_appr', false);

            if (this.activeNotificationCallback) {
              this.activeNotificationCallback(task);
            }
          }

          // Rule 3: Deadline Reached (Exact deadline arrival time)
          const deadlineDiffMs = now.getTime() - deadlineDate.getTime();
          const reachedKey = `${task._id}_reached_${task.deadline}`;

          if (deadlineDiffMs >= 0 && deadlineDiffMs <= 15 * 60 * 1000 && !notifiedIds.includes(reachedKey)) {
            notifiedIds.push(reachedKey);
            await AsyncStorage.setItem(NOTIFIED_TASKS_KEY, JSON.stringify(notifiedIds));

            const title = 'Deadline Reached!';
            const body = `"${task.title}" deadline has arrived.`;

            this.triggerNativeSystemNotification(title, body, task._id + '_reached', true);

            if (this.activeNotificationCallback) {
              this.activeNotificationCallback(task);
            }
          }
        }
      }
    }
  }

  /**
   * Starts monitoring scheduled tasks every 3 seconds.
   */
  static startMonitoring(getTasks: () => Task[]) {
    this.requestPermission().catch(() => {});
    this.tasksGetter = getTasks;

    if (this.timerId) clearInterval(this.timerId);

    // Initial check & alarm scheduling
    if (getTasks) {
      try {
        const tasks = getTasks();
        if (tasks) {
          this.checkTasks(tasks).catch(() => {});
        }
      } catch {}
    }

    // Recurring interval check
    this.timerId = setInterval(() => {
      if (this.tasksGetter) {
        try {
          const tasks = this.tasksGetter();
          if (tasks) {
            this.checkTasks(tasks).catch(() => {});
          }
        } catch {}
      }
    }, 3000);
  }

  static stopMonitoring() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
