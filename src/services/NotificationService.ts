import { NativeModules, Platform, PermissionsAndroid, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types';

const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';
const NOTIFIED_TASKS_KEY = 'notified_task_ids';

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

    // Helper integer hashing for unique alarm IDs per task stage
    const baseId = Math.abs(
      task._id.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    );

    // Stage 1: Scheduled Time Arrival (dateTime) -> No Mark as Complete button
    if (task.dateTime) {
      const scheduledMs = new Date(task.dateTime).getTime();
      if (!isNaN(scheduledMs) && scheduledMs > nowMs) {
        const title = 'Task Reminder';
        const body = `It's time to work on: "${task.title}"`;
        const alarmId = baseId % 1000000 + 1;
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
          const alarmId = baseId % 1000000 + 2;
          NativeModules.NativeNotificationModule.scheduleAlarm(title, body, approachingMs, task._id, false, alarmId);
        }

        // Stage 3: Deadline Reached (Exact deadline time) -> WITH "Mark as Complete" button!
        if (deadlineMs > nowMs) {
          const title = 'Deadline Reached!';
          const body = `"${task.title}" deadline has arrived.`;
          const alarmId = baseId % 1000000 + 3;
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
      const notificationId = Math.abs(
        taskId.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      );
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

          if (scheduledDiffMs >= 0 && scheduledDiffMs <= 2 * 60 * 1000 && !notifiedIds.includes(scheduledKey)) {
            notifiedIds.push(scheduledKey);
            await AsyncStorage.setItem(NOTIFIED_TASKS_KEY, JSON.stringify(notifiedIds));

            const title = 'Task Reminder';
            const body = `It's time to work on: "${task.title}"`;

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

          if (approachingDiffMs >= 0 && approachingDiffMs <= 2 * 60 * 1000 && !notifiedIds.includes(approachingKey)) {
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

          if (deadlineDiffMs >= 0 && deadlineDiffMs <= 5 * 60 * 1000 && !notifiedIds.includes(reachedKey)) {
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
    this.requestPermission();
    this.tasksGetter = getTasks;

    if (this.timerId) clearInterval(this.timerId);

    // Initial check & alarm scheduling
    this.checkTasks(getTasks());

    // Recurring interval check
    this.timerId = setInterval(() => {
      if (this.tasksGetter) {
        this.checkTasks(this.tasksGetter());
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
