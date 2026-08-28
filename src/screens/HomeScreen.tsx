import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { TrendingUpIcon } from '@hugeicons/core-free-icons';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';
import { Task } from '../types';
import { SwipeableTaskRow } from '../components/SwipeableTaskRow';
import { sortTasks } from '../utils/sortTasks';
import { FilterBar } from '../components/FilterBar';

interface DayItem {
  dayName: string;
  monthName: string;
  dayNumber: number;
  dateObj: Date;
  dateString: string;
  isToday: boolean;
  hasTasks: boolean;
}

const AnimatedDateCard: React.FC<{
  item: DayItem;
  isSelected: boolean;
  onSelect: () => void;
  theme: any;
}> = ({ item, isSelected, onSelect, theme }) => {
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isSelected ? 1 : 0,
      useNativeDriver: false,
      friction: 7,
      tension: 90,
    }).start();
  }, [isSelected, anim]);

  const animatedHeight = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [68, 76],
  });

  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.85}
      style={styles.dayCardWrapper}
    >
      <Animated.View
        style={[
          styles.dayCard,
          {
            height: animatedHeight,
            backgroundColor: isSelected ? theme.primaryButton : theme.surface,
            borderColor: isSelected ? theme.primaryButton : theme.border,
          },
          isSelected ? [styles.dayCardActive, shadows.md] : shadows.sm,
        ]}
      >
        <Text
          style={[
            styles.dayCardMonth,
            { color: isSelected ? theme.primaryButtonText : theme.textMuted },
          ]}
        >
          {item.monthName}
        </Text>
        <Text
          style={[
            styles.dayCardNum,
            { color: isSelected ? theme.primaryButtonText : theme.textPrimary },
            isSelected && styles.dayCardNumActive,
          ]}
        >
          {item.dayNumber}
        </Text>
        <Text
          style={[
            styles.dayCardName,
            { color: isSelected ? theme.primaryButtonText : theme.textMuted },
          ]}
        >
          {item.dayName}
        </Text>

        {item.hasTasks && (
          <View
            style={[
              styles.hasTaskDot,
              { backgroundColor: isSelected ? theme.primaryButtonText : theme.statusCompleted },
            ]}
          />
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { tasks, loading, toggleTask, removeTask, loadTasks, sortMode, filterMode, setFilterMode, setSortMode } = useTasks();
  const { theme } = useTheme();

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

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

  const daysStrip = useMemo<DayItem[]>(() => {
    const list: DayItem[] = [];
    const today = new Date();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = -3; i <= 3; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dateStr = d.toDateString();
      const hasTaskOnDate = tasks.some((t) => {
        const td = new Date(t.dateTime);
        return td.toDateString() === dateStr;
      });

      list.push({
        dayName: dayNames[d.getDay()],
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        dayNumber: d.getDate(),
        dateObj: d,
        dateString: dateStr,
        isToday: dateStr === today.toDateString(),
        hasTasks: hasTaskOnDate,
      });
    }
    return list;
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (selectedDate) {
        const taskDate = new Date(task.dateTime);
        const isSameDate = taskDate.toDateString() === selectedDate.toDateString();
        if (!isSameDate) return false;
      }

      if (filterMode === 'completed') return task.completed;
      if (filterMode === 'active') return !task.completed;
      return true;
    });
  }, [tasks, selectedDate, filterMode]);

  // Today's Progress Stats
  const todayTasks = useMemo(() => {
    const todayStr = new Date().toDateString();
    return tasks.filter((t) => new Date(t.dateTime).toDateString() === todayStr);
  }, [tasks]);

  const completedTodayCount = todayTasks.filter((t) => t.completed).length;
  const totalTodayCount = todayTasks.length;
  const progressPercent = totalTodayCount > 0 ? Math.round((completedTodayCount / totalTodayCount) * 100) : 0;

  const sortedTasks = useMemo(() => {
    return sortTasks(filteredTasks, sortMode);
  }, [filteredTasks, sortMode]);

  const getCurrentDateFormatted = () => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textPrimary} />}
      >
        {/* Top Header with Current Date & Profile Avatar Button */}
        <View style={styles.header}>
          <View style={styles.userSection}>
            <Text style={[styles.greetingTitle, { color: theme.textPrimary }]}>
              {getCurrentDateFormatted()}
            </Text>
          </View>

          {/* Profile Avatar Button (Navigates to Profile Screen) */}
          <TouchableOpacity
            style={[styles.profileAvatarBtn, { backgroundColor: theme.primaryButton }, shadows.sm]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={[styles.profileAvatarText, { color: theme.primaryButtonText }]}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 1. Animated 7-Day Date Selector Cards */}
        <View style={styles.dateSelectorContainer}>
          {daysStrip.map((item) => {
            const isSelected =
              selectedDate !== null &&
              item.dateObj.toDateString() === selectedDate.toDateString();

            return (
              <AnimatedDateCard
                key={item.dateString}
                item={item}
                isSelected={isSelected}
                onSelect={() => setSelectedDate(item.dateObj)}
                theme={theme}
              />
            );
          })}
        </View>

        {/* 2. Today's Progress Card */}
        <View style={[styles.progressCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.sm]}>
          <View style={styles.progressTopRow}>
            <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>Today's Progress</Text>
            <Text style={[styles.progressPercentage, { color: theme.textPrimary }]}>{progressPercent}%</Text>
          </View>
          <Text style={[styles.progressSub, { color: theme.textSecondary }]}>
            {completedTodayCount} of {totalTodayCount} tasks completed
          </Text>

          {/* Progress Bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: theme.isDark ? '#232931' : '#EAECEE' }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: '#38D9A9' }]} />
          </View>
        </View>

        {/* 3. Filter & Sort Bar */}
        <FilterBar
          filterMode={filterMode}
          sortMode={sortMode}
          onFilterChange={setFilterMode}
          onSortChange={setSortMode}
        />

        {/* 4. Tasks Rendered as Individual Cards */}
        {loading && !refreshing ? (
          <ActivityIndicator size="small" color={theme.textPrimary} style={styles.loader} />
        ) : sortedTasks.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No tasks found</Text>
            <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
              {selectedDate
                ? "No tasks for this date. Tap '+' to create one."
                : "Your task list is clear. Tap '+' to add a task."}
            </Text>
          </View>
        ) : (
          <View style={styles.taskListContainer}>
            {sortedTasks.map((item) => {
              const dateLabel = getRelativeDateLabel(item.dateTime);
              const timeLabel = new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <SwipeableTaskRow
                  key={item._id}
                  task={item}
                  theme={theme}
                  onToggle={toggleTask}
                  onDelete={removeTask}
                  onPress={(t) => navigation.navigate('AddEditTask', { task: t })}
                  dateLabel={dateLabel}
                  timeLabel={timeLabel}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.md,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  userSection: {
    flex: 1,
  },
  greetingTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 24,
  },
  greetingSub: {
    fontFamily: fontFamilies.headingRegular,
    fontSize: 14,
    marginTop: 2,
    fontStyle: 'italic',
  },
  profileAvatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  profileAvatarText: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 17,
  },
  dateSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 82,
    paddingVertical: spacing.xs,
    marginBottom: spacing.md,
    gap: 4,
  },
  dayCardWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  dayCard: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  dayCardActive: {
    borderRadius: radius.lg,
    zIndex: 10,
  },
  dayCardMonth: {
    fontFamily: fontFamilies.body,
    fontSize: 10,
    marginBottom: 1,
  },
  dayCardNum: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 15,
  },
  dayCardNumActive: {
    fontSize: 16.5,
  },
  dayCardName: {
    fontFamily: fontFamilies.body,
    fontSize: 10,
    marginTop: 1,
  },
  hasTaskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  progressCard: {
    borderRadius: radius.xl, // 24px curved radius
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 16,
  },
  progressPercentage: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 16,
  },
  progressSub: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    marginBottom: spacing.sm + 2,
  },
  progressBarTrack: {
    height: 7,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  filterCard: {
    borderRadius: radius.xl,
    padding: spacing.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  taskListContainer: {
    gap: 12,
  },
  loader: {
    paddingVertical: spacing.xl,
  },
  emptyCard: {
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  emptySub: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
