import React, { useMemo } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/colors';

export const InsightsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const { tasks } = useTasks();
  const { theme } = useTheme();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const getTimeOfDayCategory = (t: any) => {
      const explicit = t.timeOfDay;
      if (explicit && explicit !== 'General') {
        if (explicit === 'Morning') return 'Morning';
        if (explicit === 'Afternoon' || explicit === 'Workload') return 'Workload';
        if (explicit === 'Evening' || explicit === 'Night') return 'Night';
      }
      const hour = new Date(t.dateTime).getHours();
      if (hour >= 5 && hour < 12) return 'Morning';
      if (hour >= 12 && hour < 17) return 'Workload';
      return 'Night';
    };

    const morningAll = tasks.filter((t) => getTimeOfDayCategory(t) === 'Morning');
    const workloadAll = tasks.filter((t) => getTimeOfDayCategory(t) === 'Workload');
    const nightAll = tasks.filter((t) => getTimeOfDayCategory(t) === 'Night');

    const morningRate =
      morningAll.length > 0
        ? Math.round((morningAll.filter((t) => t.completed).length / morningAll.length) * 100)
        : 0;

    const workloadRate =
      workloadAll.length > 0
        ? Math.round((workloadAll.filter((t) => t.completed).length / workloadAll.length) * 100)
        : 0;

    const nightRate =
      nightAll.length > 0
        ? Math.round((nightAll.filter((t) => t.completed).length / nightAll.length) * 100)
        : 0;

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const now = new Date();
    const currentDayOfWeek = now.getDay();
    const distanceToMon = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + distanceToMon);
    monday.setHours(0, 0, 0, 0);

    const weekCounts = [0, 0, 0, 0, 0, 0, 0];
    const todayIndex = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;

    tasks.forEach((t) => {
      if (t.completed) {
        const taskDate = new Date(t.dateTime || t.updatedAt || t.createdAt);
        const diffTime = taskDate.getTime() - monday.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          weekCounts[diffDays] += 1;
        }
      }
    });

    const weekTotalCompleted = weekCounts.reduce((acc, curr) => acc + curr, 0);
    const maxWeekCount = Math.max(...weekCounts, 1);
    const barHeights = weekCounts.map((count) =>
      count === 0 ? 4 : Math.max(12, Math.round((count / maxWeekCount) * 100))
    );

    return {
      score: rate,
      total,
      completed,
      morningRate,
      workloadRate,
      nightRate,
      barHeights,
      weekCounts,
      dayNames,
      todayIndex,
      weekTotalCompleted,
    };
  }, [tasks]);

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header with Top Right Profile Button */}
        <View style={styles.header}>
          <View style={styles.headerTitleArea}>
            <Text style={[styles.pageTitle, { color: theme.textPrimary }]}>Insights</Text>
            <Text style={[styles.pageSub, { color: theme.textSecondary }]}>Track your task completion and consistency.</Text>
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

        {/* Productivity Score Overview Card */}
        <View style={[styles.scoreCard, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>PRODUCTIVITY SCORE</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: theme.textPrimary }]}>{stats.score}%</Text>
            <Text style={[styles.scoreDetail, { color: theme.textSecondary }]}>
              {stats.completed} of {stats.total} tasks completed
            </Text>
          </View>

          <View style={[styles.progressBarTrack, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={[styles.progressBarFill, { width: `${stats.score}%`, backgroundColor: theme.statusCompleted }]} />
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats.total}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Created</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
            <Text style={[styles.statNumber, { color: theme.statusCompleted }]}>{stats.completed}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completed</Text>
          </View>

          <View style={[styles.statBox, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{stats.score}%</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Completion Rate</Text>
          </View>
        </View>

        {/* Weekly Summary */}
        <View style={[styles.chartCard, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Weekly Summary</Text>
            <Text style={[styles.chartRange, { color: theme.textMuted }]}>Last 7 days</Text>
          </View>

          <View style={[styles.barsContainer, { borderBottomColor: theme.divider }]}>
            {stats.dayNames.map((day, idx) => {
              const h = stats.barHeights[idx];
              const isTodayIndex = idx === stats.todayIndex;

              return (
                <View key={day} style={styles.barColumn}>
                  <View style={[styles.barTrack, { backgroundColor: theme.backgroundSecondary }]}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${h}%`, backgroundColor: theme.textMuted },
                        isTodayIndex && { backgroundColor: theme.primary },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: theme.textMuted }, isTodayIndex && { color: theme.textPrimary, fontWeight: '700' }]}>
                    {day}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.chartFooter}>
            <Text style={[styles.chartFooterText, { color: theme.textSecondary }]}>
              {stats.weekTotalCompleted} tasks completed this week
            </Text>
          </View>
        </View>

        {/* Routine Consistency */}
        <View style={[styles.routineCard, { backgroundColor: theme.glassSurface, borderColor: theme.glassBorder }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Routine Consistency</Text>

          <View style={styles.routineList}>
            {/* Morning */}
            <View style={styles.routineRow}>
              <View style={styles.routineInfo}>
                <View style={styles.routineLabelRow}>
                  <Text style={[styles.routineName, { color: theme.textPrimary }]}>Morning Routine</Text>
                  <Text style={[styles.routinePercent, { color: theme.textSecondary }]}>{stats.morningRate}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSecondary }]}>
                  <View style={[styles.progressFill, { width: `${stats.morningRate}%`, backgroundColor: theme.textPrimary }]} />
                </View>
              </View>
            </View>

            {/* Workload */}
            <View style={styles.routineRow}>
              <View style={styles.routineInfo}>
                <View style={styles.routineLabelRow}>
                  <Text style={[styles.routineName, { color: theme.textPrimary }]}>Workload Focus</Text>
                  <Text style={[styles.routinePercent, { color: theme.textSecondary }]}>{stats.workloadRate}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSecondary }]}>
                  <View style={[styles.progressFill, { width: `${stats.workloadRate}%`, backgroundColor: theme.textPrimary }]} />
                </View>
              </View>
            </View>

            {/* Night */}
            <View style={styles.routineRow}>
              <View style={styles.routineInfo}>
                <View style={styles.routineLabelRow}>
                  <Text style={[styles.routineName, { color: theme.textPrimary }]}>Night Routine</Text>
                  <Text style={[styles.routinePercent, { color: theme.textSecondary }]}>{stats.nightRate}%</Text>
                </View>
                <View style={[styles.progressTrack, { backgroundColor: theme.backgroundSecondary }]}>
                  <View style={[styles.progressFill, { width: `${stats.nightRate}%`, backgroundColor: theme.textPrimary }]} />
                </View>
              </View>
            </View>
          </View>
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
  scoreCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  cardLabel: {
    ...typography.caption,
    fontSize: 11,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  scoreValue: {
    ...typography.displayLarge,
    fontSize: 32,
  },
  scoreDetail: {
    ...typography.bodySm,
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
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  statBox: {
    flex: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.title,
    fontSize: 20,
  },
  statLabel: {
    ...typography.caption,
    fontSize: 11,
    marginTop: 2,
  },
  chartCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.title,
    fontSize: 15,
  },
  chartRange: {
    ...typography.caption,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barTrack: {
    width: 14,
    height: 90,
    borderRadius: radius.xs,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: radius.xs,
  },
  barLabel: {
    ...typography.caption,
    fontSize: 11,
    marginTop: spacing.xs,
  },
  chartFooter: {
    marginTop: spacing.md,
  },
  chartFooterText: {
    ...typography.bodySm,
    fontSize: 12,
  },
  routineCard: {
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
  },
  routineList: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  routineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineInfo: {
    flex: 1,
  },
  routineLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  routineName: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '500',
  },
  routinePercent: {
    ...typography.bodySm,
    fontSize: 12,
  },
  progressTrack: {
    height: 5,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
