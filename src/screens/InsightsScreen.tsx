import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';
import { Task } from '../types';

export const InsightsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { theme } = useTheme();

  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(new Date().getDay());

  const handlePrevRange = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'weekly') {
      d.setDate(d.getDate() - 7);
    } else {
      d.setMonth(d.getMonth() - 1);
    }
    setSelectedDate(d);
  };

  const handleNextRange = () => {
    const d = new Date(selectedDate);
    if (viewMode === 'weekly') {
      d.setDate(d.getDate() + 7);
    } else {
      d.setMonth(d.getMonth() + 1);
    }
    setSelectedDate(d);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `My DailyLoop Productivity Progress: ${stats.score}% completion rate! 🚀`,
      });
    } catch (error) {
      // Ignored share error
    }
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // 1. Weekly Data Calculation
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentDayOfWeek = selectedDate.getDay();

    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - currentDayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    const weekTotals = [0, 0, 0, 0, 0, 0, 0];
    const weekCompleted = [0, 0, 0, 0, 0, 0, 0];

    tasks.forEach((t) => {
      const taskDate = new Date(t.dateTime || t.updatedAt || t.createdAt);
      const diffTime = taskDate.getTime() - startOfWeek.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays < 7) {
        weekTotals[diffDays] += 1;
        if (t.completed) {
          weekCompleted[diffDays] += 1;
        }
      }
    });

    const weekRates = weekTotals.map((tot, idx) => {
      if (tot === 0) return 0;
      return Math.round((weekCompleted[idx] / tot) * 100);
    });

    const totalWeekTasks = weekTotals.reduce((a, b) => a + b, 0);
    const totalWeekCompleted = weekCompleted.reduce((a, b) => a + b, 0);
    const avgWeekRate = totalWeekTasks > 0 ? Math.round((totalWeekCompleted / totalWeekTasks) * 100) : rate;

    // 2. Monthly Data Calculation
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const startingDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const monthTotals = new Array(daysInMonth).fill(0);
    const monthCompleted = new Array(daysInMonth).fill(0);

    tasks.forEach((t) => {
      const taskDate = new Date(t.dateTime || t.updatedAt || t.createdAt);
      if (taskDate.getFullYear() === year && taskDate.getMonth() === month) {
        const dayNum = taskDate.getDate() - 1;
        if (dayNum >= 0 && dayNum < daysInMonth) {
          monthTotals[dayNum] += 1;
          if (t.completed) {
            monthCompleted[dayNum] += 1;
          }
        }
      }
    });

    const monthRates = monthTotals.map((tot, idx) => {
      if (tot === 0) return 0;
      return Math.round((monthCompleted[idx] / tot) * 100);
    });

    const totalMonthTasks = monthTotals.reduce((a, b) => a + b, 0);
    const totalMonthCompleted = monthCompleted.reduce((a, b) => a + b, 0);
    const avgMonthRate = totalMonthTasks > 0 ? Math.round((totalMonthCompleted / totalMonthTasks) * 100) : rate;

    // Selected Day Tasks Breakdown
    const selectedDayDate = new Date(startOfWeek);
    selectedDayDate.setDate(startOfWeek.getDate() + selectedDayIdx);
    const selectedDayStr = selectedDayDate.toDateString();

    const selectedDayTasks = tasks.filter(
      (t) => new Date(t.dateTime).toDateString() === selectedDayStr
    );

    return {
      score: rate,
      total,
      completed,
      dayNames,
      weekRates,
      todayIndex: currentDayOfWeek,
      avgWeekRate,
      avgMonthRate,
      startingDayOfWeek,
      daysInMonth,
      monthRates,
      monthTotals,
      selectedDayDate,
      selectedDayTasks,
    };
  }, [tasks, selectedDate, selectedDayIdx]);

  const monthYearLabel = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const handleBackPress = () => {
    if (navigation) {
      if (navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Main');
      }
    }
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      {/* Top Header Bar Matching Reference Screenshot */}
      <View style={[styles.topHeaderBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.headerBackBtn}>
          <Icon name="chevron-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Report</Text>
        <TouchableOpacity onPress={handleShare} style={styles.headerShareBtn}>
          <Text style={[styles.headerShareText, { color: theme.textSecondary }]}>Share</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Segmented Mode Selector Pill (Weekly vs Monthly) */}
        <View style={[styles.modeSelectorPill, { backgroundColor: theme.surfaceSecondary, borderColor: theme.border }]}>
          <TouchableOpacity
            style={[
              styles.modePillBtn,
              viewMode === 'weekly' && { backgroundColor: theme.surface, borderColor: theme.border },
              viewMode === 'weekly' && shadows.sm,
            ]}
            onPress={() => setViewMode('weekly')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modePillText,
                { color: viewMode === 'weekly' ? theme.textPrimary : theme.textMuted },
                viewMode === 'weekly' && styles.modePillTextActive,
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.modePillBtn,
              viewMode === 'monthly' && { backgroundColor: theme.surface, borderColor: theme.border },
              viewMode === 'monthly' && shadows.sm,
            ]}
            onPress={() => setViewMode('monthly')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.modePillText,
                { color: viewMode === 'monthly' ? theme.textPrimary : theme.textMuted },
                viewMode === 'monthly' && styles.modePillTextActive,
              ]}
            >
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Date Range Step Navigator */}
        <View style={styles.dateStepNav}>
          <TouchableOpacity onPress={handlePrevRange} style={styles.stepArrowBtn}>
            <Icon name="chevron-left" size={20} color={theme.textMuted} />
          </TouchableOpacity>
          <Text style={[styles.dateStepLabel, { color: theme.textPrimary }]}>{monthYearLabel}</Text>
          <TouchableOpacity onPress={handleNextRange} style={styles.stepArrowBtn}>
            <Icon name="chevron-right" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Main Chart Card (Matches Weekly or Monthly Reference Screenshot) */}
        <View style={[styles.chartCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
          <View style={styles.chartTitleRow}>
            <Text style={[styles.chartTitleText, { color: theme.textSecondary }]}>
              {viewMode === 'weekly' ? 'Weekly Completion Rate' : 'Monthly Completion Rate'}
            </Text>
            <Icon name="info" size={13} color={theme.textMuted} style={styles.infoIcon} />
          </View>

          <Text style={[styles.chartMetricValue, { color: theme.textPrimary }]}>
            {viewMode === 'weekly' ? `${stats.avgWeekRate}%` : `${stats.avgMonthRate}%`}
          </Text>

          {viewMode === 'weekly' ? (
            /* Weekly 7 Capsule Bars View */
            <View style={styles.capsuleBarsRow}>
              {stats.dayNames.map((day, idx) => {
                const rate = stats.weekRates[idx];
                const isSelectedDay = idx === selectedDayIdx;

                return (
                  <TouchableOpacity
                    key={day}
                    style={styles.capsuleColumn}
                    onPress={() => setSelectedDayIdx(idx)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.capsuleTrack, { backgroundColor: theme.surfaceSecondary }]}>
                      <View
                        style={[
                          styles.capsuleFill,
                          {
                            height: `${rate > 0 ? rate : 0}%`,
                            backgroundColor: isSelectedDay ? theme.primaryButton : (rate > 0 ? theme.textPrimary : 'transparent'),
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.capsuleDayLabel,
                        { color: isSelectedDay ? theme.textPrimary : theme.textMuted },
                        isSelectedDay && styles.capsuleDayLabelActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            /* Monthly Grid View Matching Image 2 */
            <View style={styles.monthlyGridContainer}>
              <View style={styles.monthHeaderRow}>
                {stats.dayNames.map((d) => (
                  <Text key={d} style={[styles.monthHeaderDayLabel, { color: theme.textMuted }]}>
                    {d}
                  </Text>
                ))}
              </View>

              <View style={styles.monthGridCellsContainer}>
                {/* Empty cells for starting offset */}
                {Array.from({ length: stats.startingDayOfWeek }).map((_, i) => (
                  <View key={`empty-${i}`} style={styles.monthCellBox} />
                ))}

                {/* Days 1 to daysInMonth */}
                {Array.from({ length: stats.daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const rate = stats.monthRates[i];
                  const hasTasks = stats.monthTotals[i] > 0;

                  return (
                    <View key={`day-${dayNum}`} style={styles.monthCellBox}>
                      <Text style={[styles.monthCellNumText, { color: theme.textMuted }]}>{dayNum}</Text>
                      <View style={[styles.monthCapsuleTrack, { backgroundColor: theme.surfaceSecondary }]}>
                        <View
                          style={[
                            styles.monthCapsuleFill,
                            {
                              height: `${rate}%`,
                              backgroundColor: rate > 0 ? theme.primaryButton : (hasTasks ? theme.borderStrong : 'transparent'),
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <Text style={[styles.chartHintSubtext, { color: theme.textMuted }]}>
            Tap on any day to inspect daily completion details
          </Text>
        </View>

        {/* Selected Day Mission Details Section Matching Bottom of Reference Image 1 */}
        <View style={[styles.detailsCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
          <Text style={[styles.detailsTitle, { color: theme.textPrimary }]}>
            {stats.selectedDayDate.toLocaleDateString('en-US', { weekday: 'long' })} Mission Details
          </Text>

          {stats.selectedDayTasks.length === 0 ? (
            <Text style={[styles.noTasksText, { color: theme.textSecondary }]}>
              No tasks scheduled on this day.
            </Text>
          ) : (
            <View style={styles.detailsTaskList}>
              {stats.selectedDayTasks.map((t: Task) => (
                <View key={t._id} style={[styles.detailTaskRow, { borderBottomColor: theme.border }]}>
                  <View
                    style={[
                      styles.detailTaskCheck,
                      { borderColor: t.completed ? theme.statusCompleted : theme.borderStrong },
                      t.completed && { backgroundColor: theme.statusCompleted },
                    ]}
                  >
                    {t.completed && <Icon name="check" size={11} color="#000000" />}
                  </View>
                  <Text
                    style={[
                      styles.detailTaskTitle,
                      { color: theme.textPrimary },
                      t.completed && { color: theme.textMuted, textDecorationLine: 'line-through' },
                    ]}
                  >
                    {t.title}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 18,
    fontWeight: '600',
  },
  headerShareBtn: {
    padding: spacing.xs,
  },
  headerShareText: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    fontWeight: '500',
  },
  container: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.md,
    paddingBottom: 110,
  },
  modeSelectorPill: {
    flexDirection: 'row',
    borderRadius: radius.pill,
    padding: 3,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  modePillBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.pill,
  },
  modePillText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: '500',
  },
  modePillTextActive: {
    fontWeight: '700',
  },
  dateStepNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  stepArrowBtn: {
    padding: spacing.xs,
  },
  dateStepLabel: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 15,
    fontWeight: '600',
  },
  chartCard: {
    borderRadius: radius.xl, // 32px curved card
    padding: spacing.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  chartTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chartTitleText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: '500',
  },
  infoIcon: {
    marginLeft: 4,
  },
  chartMetricValue: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 36,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  capsuleBarsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 155,
    marginBottom: spacing.md,
  },
  capsuleColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'space-between',
  },
  capsuleTrack: {
    width: 28,
    height: 130,
    borderRadius: 14, // Capsule pill shape
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  capsuleFill: {
    width: '100%',
    borderRadius: 14,
  },
  capsuleDayLabel: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 6,
  },
  capsuleDayLabelActive: {
    fontWeight: '700',
  },
  monthlyGridContainer: {
    marginBottom: spacing.md,
  },
  monthHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  monthHeaderDayLabel: {
    width: '14%',
    textAlign: 'center',
    fontFamily: fontFamilies.body,
    fontSize: 11,
  },
  monthGridCellsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthCellBox: {
    width: '14.28%',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  monthCellNumText: {
    fontFamily: fontFamilies.body,
    fontSize: 10,
    marginBottom: 2,
  },
  monthCapsuleTrack: {
    width: 24,
    height: 32,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  monthCapsuleFill: {
    width: '100%',
    borderRadius: 8,
  },
  chartHintSubtext: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  detailsCard: {
    borderRadius: radius.xl, // 32px curved card
    padding: spacing.lg,
    borderWidth: 1,
  },
  detailsTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  noTasksText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
  },
  detailsTaskList: {
    gap: spacing.xs,
  },
  detailTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
  },
  detailTaskCheck: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.2,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTaskTitle: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
  },
});
