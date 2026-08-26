import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/colors';

export const CalendarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { tasks, toggleTask } = useTasks();
  const { theme } = useTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };

  const getPriorityColor = (priority?: string) => {
    if (priority === 'high') return theme.priorityHigh;
    if (priority === 'medium') return theme.priorityMedium;
    return theme.priorityLow;
  };

  // Generate 35 calendar matrix cells
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();
    const adjustedStart = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;

    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - adjustedStart);

    const matrix: { dateObj: Date; dayNum: number; isCurrentMonth: boolean; taskCount: number }[] = [];
    for (let i = 0; i < 35; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const dayTasks = tasks.filter((t) => {
        const td = new Date(t.dateTime);
        return (
          td.getFullYear() === d.getFullYear() &&
          td.getMonth() === d.getMonth() &&
          td.getDate() === d.getDate()
        );
      });

      matrix.push({
        dateObj: d,
        dayNum: d.getDate(),
        isCurrentMonth: d.getMonth() === month,
        taskCount: dayTasks.length,
      });
    }

    return matrix;
  }, [currentMonth, tasks]);

  // Selected day's tasks
  const selectedDayTasks = useMemo(() => {
    return tasks.filter((t) => {
      const td = new Date(t.dateTime);
      return (
        td.getFullYear() === selectedDate.getFullYear() &&
        td.getMonth() === selectedDate.getMonth() &&
        td.getDate() === selectedDate.getDate()
      );
    });
  }, [tasks, selectedDate]);

  const monthYearHeader = currentMonth.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  const selectedDateHeader = selectedDate.toLocaleDateString('default', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with Top Right Profile Button */}
        <View style={styles.header}>
          <View style={styles.headerTitleArea}>
            <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Calendar</Text>
            <Text style={[styles.pageSub, { color: theme.textSecondary }]}>Schedule and upcoming task deadlines.</Text>
          </View>

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

        {/* Calendar Matrix Card */}
        <View style={[styles.calendarCard, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
          {/* Month/Year Header */}
          <View style={styles.monthHeader}>
            <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>{monthYearHeader}</Text>
            <View style={styles.monthNavBtns}>
              <TouchableOpacity onPress={prevMonth} style={[styles.navBtn, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Text style={[styles.navBtnText, { color: theme.textPrimary }]}>‹</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={nextMonth} style={[styles.navBtn, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Text style={[styles.navBtnText, { color: theme.textPrimary }]}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Weekday Labels */}
          <View style={styles.weekLabelsRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
              <Text key={idx} style={[styles.weekLabelText, { color: theme.textMuted }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Days Grid */}
          <View style={styles.gridContainer}>
            {calendarDays.map((cell, idx) => {
              const isSelected =
                cell.dateObj.toDateString() === selectedDate.toDateString();

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.dayCell,
                    isSelected && { backgroundColor: theme.primary },
                    !cell.isCurrentMonth && styles.dayCellOutside,
                  ]}
                  onPress={() => setSelectedDate(cell.dateObj)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      { color: theme.textPrimary },
                      isSelected && { color: theme.onPrimary, fontWeight: '700' },
                      !cell.isCurrentMonth && { color: theme.textMuted },
                    ]}
                  >
                    {cell.dayNum}
                  </Text>

                  {cell.taskCount > 0 && (
                    <View style={styles.dotsRow}>
                      <View style={[styles.taskDot, { backgroundColor: theme.statusCompleted }, isSelected && { backgroundColor: theme.onPrimary }]} />
                      {cell.taskCount > 1 && (
                        <View style={[styles.taskDot, { backgroundColor: theme.statusCompleted }, isSelected && { backgroundColor: theme.onPrimary }]} />
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tasks Agenda for Selected Day */}
        <View style={[styles.taskListCard, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
          <Text style={[styles.selectedDayTitle, { color: theme.textPrimary }]}>Scheduled on {selectedDateHeader}</Text>

          {selectedDayTasks.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks scheduled on this day.</Text>
            </View>
          ) : (
            selectedDayTasks.map((t) => {
              const formattedTime = new Date(t.dateTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              const pColor = getPriorityColor(t.priority);

              return (
                <View key={t._id} style={[styles.taskItem, { borderTopColor: theme.divider }]}>
                  <TouchableOpacity
                    onPress={() => toggleTask(t._id)}
                    style={[
                      styles.checkbox,
                      { borderColor: pColor },
                      t.completed && { backgroundColor: pColor, borderColor: pColor },
                    ]}
                  >
                    {t.completed && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>

                  <View style={styles.taskContent}>
                    <Text style={[styles.taskTitle, { color: theme.textPrimary }, t.completed && { color: theme.textMuted, textDecorationLine: 'line-through' }]}>
                      {t.title}
                    </Text>
                    <Text style={[styles.taskTime, { color: theme.textMuted }]}>
                      {selectedDateHeader} · {formattedTime}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    paddingHorizontal: spacing.containerPadding, // 24dp
    paddingTop: spacing.lg,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  headerTitleArea: {
    flex: 1,
  },
  pageTitle: {
    ...typography.displayLarge,
    fontSize: 26,
  },
  pageSub: {
    ...typography.body,
    fontSize: 14,
    marginTop: 2,
  },
  profileAvatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md,
    borderWidth: 1,
  },
  profileAvatarText: {
    fontSize: 18,
    fontWeight: '800',
  },
  calendarCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  monthTitle: {
    ...typography.title,
    fontSize: 16,
  },
  monthNavBtns: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
  weekLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  weekLabelText: {
    width: 36,
    textAlign: 'center',
    ...typography.caption,
    fontSize: 11,
    fontWeight: '600',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 4,
  },
  dayCell: {
    width: 38,
    height: 42,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCellOutside: {
    opacity: 0.25,
  },
  dayCellText: {
    ...typography.body,
    fontSize: 13,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  taskDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  taskListCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  selectedDayTitle: {
    ...typography.title,
    fontSize: 15,
    marginBottom: spacing.md,
  },
  emptyBox: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.bodySm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    ...typography.body,
    fontSize: 14,
    fontWeight: '500',
  },
  taskTime: {
    ...typography.caption,
    fontSize: 12,
    marginTop: 2,
  },
});
