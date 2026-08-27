import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';

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
    weekday: 'long',
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
            <Text style={[styles.pageSub, { color: theme.textSecondary }]}>
              Schedule and upcoming task deadlines.
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.profileAvatarBtn, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.sm]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={[styles.profileAvatarText, { color: theme.textPrimary }]}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Matrix Card */}
        <View style={[styles.calendarCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
          {/* Month/Year Header */}
          <View style={styles.monthHeader}>
            <Text style={[styles.monthTitle, { color: theme.textPrimary }]}>{monthYearHeader}</Text>
            <View style={styles.monthNavBtns}>
              <TouchableOpacity
                onPress={prevMonth}
                style={[styles.navBtn, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                activeOpacity={0.7}
              >
                <Icon name="chevron-left" size={16} color={theme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={nextMonth}
                style={[styles.navBtn, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}
                activeOpacity={0.7}
              >
                <Icon name="chevron-right" size={16} color={theme.textPrimary} />
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
                    isSelected && { backgroundColor: theme.primaryButton },
                    !cell.isCurrentMonth && styles.dayCellOutside,
                  ]}
                  onPress={() => setSelectedDate(cell.dateObj)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.dayCellText,
                      { color: theme.textPrimary },
                      isSelected && { color: theme.primaryButtonText, fontWeight: '700' },
                      !cell.isCurrentMonth && { color: theme.textMuted },
                    ]}
                  >
                    {cell.dayNum}
                  </Text>

                  {cell.taskCount > 0 && (
                    <View style={styles.dotsRow}>
                      <View
                        style={[
                          styles.taskDot,
                          { backgroundColor: isSelected ? theme.primaryButtonText : theme.statusCompleted },
                        ]}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Tasks Agenda for Selected Day */}
        <View style={[styles.taskListCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
          <Text style={[styles.selectedDayTitle, { color: theme.textPrimary }]}>{selectedDateHeader}</Text>

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
                <View key={t._id} style={[styles.taskItem, { borderTopColor: theme.border }]}>
                  <TouchableOpacity
                    onPress={() => toggleTask(t._id)}
                    style={[
                      styles.checkbox,
                      { borderColor: t.completed ? theme.statusCompleted : theme.borderStrong },
                      t.completed && { backgroundColor: theme.statusCompleted, borderColor: theme.statusCompleted },
                    ]}
                    activeOpacity={0.7}
                  >
                    {t.completed && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>

                  <View style={styles.taskContent}>
                    <Text
                      style={[
                        styles.taskTitle,
                        { color: theme.textPrimary },
                        t.completed && { color: theme.textMuted, textDecorationLine: 'line-through' },
                      ]}
                    >
                      {t.title}
                    </Text>
                    <Text style={[styles.taskTime, { color: theme.textMuted }]}>
                      {formattedTime}
                    </Text>
                  </View>
                  <View style={[styles.dotIndicator, { backgroundColor: pColor }]} />
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
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.md,
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
    fontFamily: fontFamilies.headingBold,
    fontSize: 26,
    fontWeight: '700',
  },
  pageSub: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
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
    fontFamily: fontFamilies.body,
    fontSize: 16,
    fontWeight: '700',
  },
  calendarCard: {
    borderRadius: radius.xl, // 32px curved radius
    padding: spacing.lg,
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
    fontFamily: fontFamilies.headingBold,
    fontSize: 18,
    fontWeight: '600',
  },
  monthNavBtns: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  weekLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  weekLabelText: {
    width: 36,
    textAlign: 'center',
    fontFamily: fontFamilies.body,
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
    height: 40,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 2,
  },
  dayCellOutside: {
    opacity: 0.25,
  },
  dayCellText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  taskListCard: {
    borderRadius: radius.xl, // 32px curved radius
    padding: spacing.lg,
    borderWidth: 1,
  },
  selectedDayTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  emptyBox: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.2,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 11,
    fontWeight: '800',
    color: '#000000',
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    fontWeight: '500',
  },
  taskTime: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    marginTop: 2,
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: spacing.xs,
  },
});
