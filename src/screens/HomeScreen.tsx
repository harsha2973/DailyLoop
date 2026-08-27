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
import Icon from 'react-native-vector-icons/Feather';
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
  const [groupBy, setGroupBy] = useState<'category' | 'timeOfDay'>('timeOfDay');
  const [collapsedGroups, setCollapsedGroups] = useState<{ [key: string]: boolean }>({});
  const [refreshing, setRefreshing] = useState(false);

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

  const getTimeOfDayLabel = (task: Task): string => {
    if (
      task.timeOfDay &&
      task.timeOfDay.trim() &&
      task.timeOfDay !== 'General'
    ) {
      return task.timeOfDay;
    }

    const taskDate = new Date(task.dateTime);
    const hour = taskDate.getHours();

    if (hour >= 12 && hour < 17) return 'Workload';
    if (hour >= 17 && hour < 21) return 'Workload';
    if (hour >= 21 || hour < 5) return 'Night';
    return 'Morning';
  };

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

  const renderGroupIconName = (groupTitle: string): string => {
    const title = groupTitle.toLowerCase();
    if (title.includes('morning')) return 'clock';
    if (title.includes('workload')) return 'sun';
    if (title.includes('night') || title.includes('evening')) return 'moon';
    if (title.includes('work')) return 'briefcase';
    if (title.includes('personal')) return 'user';
    if (title.includes('health')) return 'activity';
    if (title.includes('study')) return 'book-open';
    return 'folder';
  };

  const renderTaskGroup = (title: string, taskList: Task[]) => {
    if (!taskList || taskList.length === 0) return null;
    const isCollapsed = collapsedGroups[title];
    const sortedTasks = sortTasks(taskList, sortMode);

    return (
      <View key={title} style={styles.groupSection}>
        <TouchableOpacity
          style={styles.groupHeaderRow}
          onPress={() => toggleGroupCollapse(title)}
          activeOpacity={0.7}
        >
          <View style={styles.groupTitleContainer}>
            <Icon
              name={renderGroupIconName(title)}
              size={15}
              color={theme.textPrimary}
              style={styles.groupHeaderIcon}
            />
            <Text style={[styles.groupTitleText, { color: theme.textPrimary }]}>
              {title} · {sortedTasks.length}
            </Text>
          </View>
          <Icon
            name={isCollapsed ? 'chevron-right' : 'chevron-down'}
            size={16}
            color={theme.textMuted}
          />
        </TouchableOpacity>

        {!isCollapsed && (
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
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.textPrimary} />}
      >
        {/* Top Header with User Greeting & Profile Avatar Button */}
        <View style={styles.header}>
          <View style={styles.userSection}>
            <Text style={[styles.greetingTitle, { color: theme.textPrimary }]}>
              Hey, {user?.name ? user.name.split(' ')[0] : 'Harsha'} 👋
            </Text>
            <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>
              Let's make progress today!
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
        <View style={[styles.progressCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
          <View style={styles.progressTopRow}>
            <View style={styles.progressHeaderTitleRow}>
              <Icon name="trending-up" size={16} color={theme.textPrimary} style={styles.progressHeaderIcon} />
              <Text style={[styles.progressTitle, { color: theme.textPrimary }]}>Today's Progress</Text>
            </View>
            <Text style={[styles.progressPercentage, { color: theme.textPrimary }]}>{progressPercent}%</Text>
          </View>
          <Text style={[styles.progressSub, { color: theme.textSecondary }]}>
            {completedTodayCount} of {totalTodayCount} tasks completed
          </Text>

          {/* Progress Bar */}
          <View style={[styles.progressBarTrack, { backgroundColor: theme.surfaceSecondary }]}>
            <View style={[styles.progressBarFill, { width: `${progressPercent}%`, backgroundColor: theme.statusCompleted }]} />
          </View>
        </View>

        {/* 3. Large Curved Task Groups Container Card */}
        <View style={[styles.mainContentCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
          {/* Segmented Filter Bar */}
          <FilterBar
            filterMode={filterMode}
            sortMode={sortMode}
            onFilterChange={setFilterMode}
            onSortChange={setSortMode}
          />

          {/* Group By Selector Bar */}
          <View style={styles.groupByRow}>
            <Text style={[styles.groupByLabel, { color: theme.textMuted }]}>GROUP BY:</Text>
            <View style={styles.groupByStrip}>
              <TouchableOpacity
                style={[
                  styles.groupByPill,
                  { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                  groupBy === 'category' && { backgroundColor: theme.primaryButton, borderColor: theme.primaryButton },
                ]}
                onPress={() => setGroupBy('category')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.groupByText,
                    { color: theme.textSecondary },
                    groupBy === 'category' && { color: theme.primaryButtonText, fontWeight: '700' },
                  ]}
                >
                  Category
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.groupByPill,
                  { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
                  groupBy === 'timeOfDay' && { backgroundColor: theme.primaryButton, borderColor: theme.primaryButton },
                ]}
                onPress={() => setGroupBy('timeOfDay')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.groupByText,
                    { color: theme.textSecondary },
                    groupBy === 'timeOfDay' && { color: theme.primaryButtonText, fontWeight: '700' },
                  ]}
                >
                  Time of Day
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Task Groups */}
          {loading && !refreshing ? (
            <ActivityIndicator size="small" color={theme.textPrimary} style={styles.loader} />
          ) : filteredTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No tasks found</Text>
              <Text style={[styles.emptySub, { color: theme.textSecondary }]}>
                {selectedDate
                  ? "No tasks for this date. Tap '+ New' to create one."
                  : "Your task list is clear. Tap '+ New' to add a task."}
              </Text>
            </View>
          ) : (
            <View style={styles.groupsContainer}>
              {Object.keys(groupedTasks).map((groupName) =>
                renderTaskGroup(groupName, groupedTasks[groupName])
              )}
            </View>
          )}
        </View>
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
    fontWeight: '700',
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
    fontFamily: fontFamilies.body,
    fontSize: 17,
    fontWeight: '700',
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
    fontWeight: '500',
    marginBottom: 1,
  },
  dayCardNum: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 15,
    fontWeight: '700',
  },
  dayCardNumActive: {
    fontSize: 16.5,
    fontWeight: '800',
  },
  dayCardName: {
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  hasTaskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 2,
  },
  progressCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressHeaderIcon: {
    marginRight: 6,
  },
  progressTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 16,
    fontWeight: '600',
  },
  progressPercentage: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 16,
    fontWeight: '700',
  },
  progressSub: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  mainContentCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
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
    fontWeight: '600',
  },
  groupByStrip: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  groupByPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  groupByText: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: '500',
  },
  groupsContainer: {
    gap: spacing.lg,
  },
  groupSection: {
    marginBottom: spacing.xs,
  },
  groupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  groupTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  groupHeaderIcon: {
    marginRight: 6,
  },
  groupTitleText: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 16,
    fontWeight: '600',
  },
  taskListContainer: {
    gap: 4,
  },
  loader: {
    paddingVertical: spacing.xl,
  },
  emptyState: {
    paddingVertical: spacing.xl,
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
