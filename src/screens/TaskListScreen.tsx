import React, { useEffect, useState, useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTasks } from '../context/TaskContext';
import { useAuth } from '../context/AuthContext';
import { TaskItem } from '../components/TaskItem';
import { FilterBar } from '../components/FilterBar';
import { colors, radius, spacing, typography } from '../theme/colors';
import { Task } from '../types';

export const TaskListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const {
    visibleTasks,
    isLoading,
    error,
    sortMode,
    filterMode,
    loadTasks,
    toggleComplete,
    removeTask,
    setSortMode,
    setFilterMode,
  } = useTasks();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  }, [loadTasks]);

  const openTask = (task: Task) => navigation.navigate('AddEditTask', { task });

  const activeCount = visibleTasks.filter((t) => !t.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={styles.subGreeting}>
            {activeCount} task{activeCount === 1 ? '' : 's'} on your plate
          </Text>
        </View>
        <TouchableOpacity onPress={logout} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.logout}>Log out</Text>
        </TouchableOpacity>
      </View>

      <FilterBar
        filterMode={filterMode}
        sortMode={sortMode}
        onFilterChange={setFilterMode}
        onSortChange={setSortMode}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TaskItem
            task={item}
            onToggle={toggleComplete}
            onDelete={removeTask}
            onPress={openTask}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Nothing here yet</Text>
              <Text style={styles.emptyText}>Tap the + button to add your first task.</Text>
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('AddEditTask')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.title,
    color: colors.textPrimary,
  },
  subGreeting: {
    color: colors.textMuted,
    marginTop: 2,
  },
  logout: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xl * 2,
  },
  emptyTitle: {
    ...typography.title,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyText: {
    color: colors.textMuted,
  },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabIcon: {
    fontSize: 30,
    color: colors.background,
    fontWeight: '700',
    marginTop: -2,
  },
});
