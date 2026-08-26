import React, { useState, useMemo, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography, fontFamilies } from '../theme/colors';
import { Task } from '../types';
import { SwipeableTaskRow } from '../components/SwipeableTaskRow';
import { sortTasks } from '../utils/sortTasks';

interface DayItem {
  dayName: string;
  dayNumber: number;
  dateObj: Date;
  dateString: string;
  isToday: boolean;
  hasTasks: boolean;
}

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { tasks, loading, toggleTask, removeTask, loadTasks, sortMode } = useTasks();
  const { theme } = useTheme();

  const [selectedSegment, setSelectedSegment] = useState<'todo' | 'completed' | 'pending'>('todo');
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [groupBy, setGroupBy] = useState<'category' | 'timeOfDay'>('category');
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);

  // Refresh tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const toggleGroupCollapse = (groupName: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  // Helper to format date relatively (Today, Tomorrow, Yesterday, Aug 27)
  const getRelativeDateLabel = (dateISO: string): string => {
    const taskDate = new Date(dateISO);
    const now = new Date();

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const targetDay = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

    const diffTime = targetDay.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';

    return taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Compact 5-day week selector strip
  const daysStrip = useMemo<DayItem[]>(() => {
    const list: DayItem[] = [];
    const today = new Date();
    const currentDay = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

      const dateStr = d.toDateString();
      const hasTaskOnDate = tasks.some((t) => {
        const td = new Date(t.dateTime);
        return td.toDateString() === dateStr;
      });

      list.push({
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        dateObj: d,
        dateString: dateStr,
        isToday: dateStr === today.toDateString(),
        hasTasks: hasTaskOnDate,
      });
    }
    return list;
  }, [tasks]);

  // Filter tasks based on selected date & segment
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Date filter
      if (selectedDate) {
        const taskDate = new Date(task.dateTime);
        const isSameDate = taskDate.toDateString() === selectedDate.toDateString();
        if (!isSameDate) return false;
      }

      // Segment filter
      if (selectedSegment === 'completed') return task.completed;
      if (selectedSegment === 'todo') return !task.completed;
      if (selectedSegment === 'pending') {
        const isPastDeadline = new Date(task.deadline).getTime() < Date.now();
        return !task.completed && isPastDeadline;
      }
      return true;
    });
  }, [tasks, selectedDate, selectedSegment]);

  // Calculate Time of Day based on task's scheduled time and explicit preference
  const getTimeOfDayLabel = (task: Task): string => {
    if (
      task.timeOfDay &&
      task.timeOfDay.trim() &&
      task.timeOfDay !== 'General' &&
      task.timeOfDay !== 'Morning'
    ) {
      return task.timeOfDay;
    }

    const taskDate = new Date(task.dateTime);
    const hour = taskDate.getHours();

    if (hour >= 12 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 21) return 'Evening';
    if (hour >= 21 || hour < 5) return 'Night';
    return 'Morning';
  };

  // Dynamic Grouping by Category or Time of Day
  const groupedTasks = useMemo(() => {
    const groups: { [key: string]: Task[] } = {};

    filteredTasks.forEach((task) => {
      let groupKey = 'General';

      if (groupBy === 'category') {
        groupKey = task.category && task.category.trim() ? task.category : 'General';
      } else {
        groupKey = getTimeOfDayLabel(task);
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });

    return groups;
  }, [filteredTasks, groupBy]);

  // Today's Progress Stats
  const todayTasks = useMemo(() => {
    const todayStr = new Date().toDateString();
    return tasks.filter((t) => new Date(t.dateTime).toDateString() === todayStr);
  }, [tasks]);

  const completedTodayCount = todayTasks.filter((t) => t.completed).length;
  const totalTodayCount = todayTasks.length;
  const progressPercent = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  const renderTaskGroup = (title: string, taskList: Task[]) => {
    if (!taskList || taskList.length === 0) return null;
    const isCollapsed = collapsedGroups[title];
    const sortedTasks = sortTasks(taskList, sortMode);

    return (
      <View key={title} style={[styles.groupCard, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
        <TouchableOpacity
          style={styles.groupHeaderRow}
          onPress={() => toggleGroupCollapse(title)}
          activeOpacity={0.7}
        >
          <Text style={[styles.groupTitleText, { color: theme.textPrimary }]}>
            {title} · {sortedTasks.length}
          </Text>
          <Text style={[styles.groupChevron, { color: theme.textMuted }]}>{isCollapsed ? '►' : '▼'}</Text>
        </TouchableOpacity>

        {!isCollapsed &&
          sortedTasks.map((item, idx) => {
            const dateLabel = getRelativeDateLabel(item.dateTime);
            const timeLabel = new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <View key={item._id} style={[idx > 0 && { borderTopWidth: 1, borderTopColor: theme.divider }]}>
                <SwipeableTaskRow
                  task={item}
                  theme={theme}
                  onToggle={toggleTask}
                  onDelete={removeTask}
                  onPress={(t) => navigation.navigate('AddEditTask', { task: t })}
                  dateLabel={dateLabel}
                  timeLabel={timeLabel}
                />
              </View>
            );
          })}
      </View>
    );
  };

  const formattedDate = (selectedDate || new Date()).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Date selector pill styling based on theme
  const getWeekPillStyle = (isSelected: boolean) => {
    if (isSelected) {
      return { backgroundColor: theme.primary, borderColor: theme.primary };
    }
    if (theme.name === 'light') {
      return { backgroundColor: '#FFFFFF', borderColor: '#E9E9E7' };
    }
    return { backgroundColor: theme.surface, borderColor: theme.border };
  };

  const getWeekTextStyle = (isSelected: boolean) => {
    if (isSelected) {
      return { color: theme.onPrimary };
    }
    return { color: theme.textSecondary };
  };

  // Group-By pill styling based on theme
  const getGroupByPillStyle = (isActive: boolean) => {
    if (isActive) {
      return { backgroundColor: theme.primary, borderColor: theme.primary };
    }
    if (theme.name === 'light') {
      return { backgroundColor: '#F1F1EF', borderColor: '#E9E9E7' };
    }
    return { backgroundColor: theme.surface, borderColor: theme.border };
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textPrimary} />}
      >
        {/* Header with Top Right Profile Avatar */}
        <View style={styles.header}>
          <View style={styles.userSection}>
            <Text style={[styles.greetingTitle, { color: theme.textPrimary }]}>Hey, {user?.name ? user.name.split(' ')[0] : 'Harsha'} 👋</Text>
            <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>Let's make progress today.</Text>
          </View>

          {/* Top Right Profile Avatar Button (UNTOUCHED) */}
          <TouchableOpacity
            style={[styles.profileAvatarBtn, { backgroundColor: theme.primary, borderColor: theme.border }]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={[styles.profileAvatarText, { color: theme.onPrimary }]}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Compact Horizontal Week Selector */}
        <View style={styles.weekSelectorSection}>
          <Text style={[styles.dateHeaderLabel, { color: theme.textMuted }]}>{formattedDate}</Text>

          <View style={styles.weekStrip}>
            <TouchableOpacity
              style={[styles.weekPill, getWeekPillStyle(selectedDate === null)]}
              onPress={() => setSelectedDate(null)}
              activeOpacity={0.8}
            >
              <Text style={[styles.weekDayName, getWeekTextStyle(selectedDate === null)]}>
                ALL
              </Text>
            </TouchableOpacity>

            {daysStrip.map((item) => {
              const isSelected =
                selectedDate !== null &&
                item.dateObj.toDateString() === selectedDate.toDateString();

              return (
                <TouchableOpacity
                  key={item.dayName + item.dayNumber}
                  style={[styles.weekPill, getWeekPillStyle(isSelected)]}
                  onPress={() => setSelectedDate(item.dateObj)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.weekDayName, getWeekTextStyle(isSelected)]}>
                    {item.dayName}
                  </Text>
                  <Text style={[styles.weekDayNumber, getWeekTextStyle(isSelected)]}>
                    {item.dayNumber}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Today's Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
          <View style={styles.progressTopRow}>
            <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>Today's Progress</Text>
            <Text style={[styles.progressPercentage, { color: theme.textPrimary }]}>{progressPercent}%</Text>
          </View>
          <Text style={[styles.progressSub, { color: theme.textSecondary }]}>
            {completedTodayCount} of {totalTodayCount} tasks completed
          </Text>

          {/* Progress Bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.statusCompleted }]} />
          </View>
        </View>

        {/* Task Status Segmented Control */}
        <View style={[styles.segmentedContainer, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.segmentBtn, selectedSegment === 'todo' && { backgroundColor: theme.primary }]}
            onPress={() => setSelectedSegment('todo')}
          >
            <Text style={[styles.segmentText, { color: theme.textSecondary }, selectedSegment === 'todo' && { color: theme.onPrimary, fontWeight: '700' }]}>
              To Do
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, selectedSegment === 'completed' && { backgroundColor: theme.primary }]}
            onPress={() => setSelectedSegment('completed')}
          >
            <Text style={[styles.segmentText, { color: theme.textSecondary }, selectedSegment === 'completed' && { color: theme.onPrimary, fontWeight: '700' }]}>
              Completed
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, selectedSegment === 'pending' && { backgroundColor: theme.primary }]}
            onPress={() => setSelectedSegment('pending')}
          >
            <Text style={[styles.segmentText, { color: theme.textSecondary }, selectedSegment === 'pending' && { color: theme.onPrimary, fontWeight: '700' }]}>
              Pending
            </Text>
          </TouchableOpacity>
        </View>

        {/* Group By Selector Bar */}
        <View style={styles.groupByRow}>
          <Text style={[styles.groupByLabel, { color: theme.textMuted }]}>GROUP BY:</Text>
          <View style={styles.groupByStrip}>
            <TouchableOpacity
              style={[styles.groupByPill, getGroupByPillStyle(groupBy === 'category')]}
              onPress={() => setGroupBy('category')}
              activeOpacity={0.8}
            >
              <Text style={[styles.groupByText, { color: theme.textSecondary }, groupBy === 'category' && { color: theme.onPrimary }]}>
                Category
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.groupByPill, getGroupByPillStyle(groupBy === 'timeOfDay')]}
              onPress={() => setGroupBy('timeOfDay')}
              activeOpacity={0.8}
            >
              <Text style={[styles.groupByText, { color: theme.textSecondary }, groupBy === 'timeOfDay' && { color: theme.onPrimary }]}>
                Time of Day
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Task Groups */}
        {loading && !refreshing ? (
          <ActivityIndicator size="small" color={theme.textPrimary} style={styles.loader} />
        ) : filteredTasks.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No tasks found</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              {selectedDate
                ? "No tasks for this day. Tap 'ALL' above or '+ New' to add a task."
                : "Your task list is clear. Tap '+ New' to add your next task."}
            </Text>
          </View>
        ) : (
          <View style={styles.groupsSection}>
            {Object.keys(groupedTasks).map((groupName) =>
              renderTaskGroup(groupName, groupedTasks[groupName])
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingHorizontal: spacing.containerPadding, // 24dp
    paddingTop: spacing.md, // Compact 14dp top padding
    paddingBottom: 105,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md, // Compact margin
  },
  userSection: {
    flex: 1,
  },
  greetingTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 25,
    fontWeight: '700',
  },
  greetingSub: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    marginTop: 2,
  },
  profileAvatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
    borderWidth: 1,
  },
  profileAvatarText: {
    fontSize: 17,
    fontWeight: '800',
  },
  weekSelectorSection: {
    marginBottom: spacing.md, // Compact spacing
  },
  dateHeaderLabel: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 5,
  },
  weekPill: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  weekDayName: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: '600',
  },
  weekDayNumber: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 1,
  },
  progressCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md, // Compact spacing
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 15,
    fontWeight: '600',
  },
  progressPercentage: {
    fontFamily: fontFamilies.heading,
    fontSize: 15,
    fontWeight: '700',
  },
  progressSub: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    marginTop: 2,
    marginBottom: 8,
  },
  progressBarTrack: {
    height: 4, // Thinner progress bar
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  segmentedContainer: {
    flexDirection: 'row',
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: spacing.sm + 2,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.xs,
    alignItems: 'center',
  },
  segmentText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: '600',
  },
  groupByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingHorizontal: 2,
  },
  groupByLabel: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    letterSpacing: 0.6,
  },
  groupByStrip: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  groupByPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.xs,
    borderWidth: 1,
  },
  groupByText: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: '600',
  },
  groupsSection: {
    gap: spacing.md, // Compact group spacing
  },
  groupCard: {
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderWidth: 1,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    marginBottom: 2,
  },
  groupTitleText: {
    fontFamily: fontFamilies.heading,
    fontSize: 14,
    fontWeight: '600',
  },
  groupChevron: {
    fontSize: 11,
  },
  loader: {
    marginTop: spacing.lg,
  },
  emptyState: {
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 15,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
