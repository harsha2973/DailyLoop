import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/colors';
import { Task } from '../types';
import { PriorityBadge } from './PriorityBadge';
import { formatDateTime, isOverdue, timeRemainingLabel } from '../utils/dateUtils';

interface Props {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (task: Task) => void;
}

export const TaskItem: React.FC<Props> = ({ task, onToggle, onDelete, onPress }) => {
  const overdue = !task.completed && isOverdue(task.deadline);

  const getPriorityColor = (priority?: string) => {
    if (priority === 'high') return colors.priorityHigh;
    if (priority === 'medium') return colors.priorityMedium;
    return colors.priorityLow;
  };

  const pColor = getPriorityColor(task.priority);

  const confirmDelete = () => {
    Alert.alert('Delete task', `Delete "${task.title}"? This can't be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(task._id) },
    ]);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onPress(task)}
      style={[styles.card, overdue && styles.cardOverdue]}
    >
      <TouchableOpacity
        onPress={() => onToggle(task._id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        style={[
          styles.checkbox,
          { borderColor: pColor },
          task.completed && { backgroundColor: pColor, borderColor: pColor },
        ]}
      >
        {task.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>

      <View style={styles.body}>
        <Text
          style={[styles.title, task.completed && styles.titleCompleted]}
          numberOfLines={1}
        >
          {task.title}
        </Text>

        {!!task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          <PriorityBadge priority={task.priority} />
          <Text style={styles.metaText}>{task.category || 'General'}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Starts {formatDateTime(task.dateTime)}</Text>
          <Text style={[styles.metaText, overdue && styles.overdueText]}>
            {task.completed ? 'Done' : timeRemainingLabel(task.deadline)}
          </Text>
        </View>
      </View>

      <TouchableOpacity onPress={confirmDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.deleteIcon}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardOverdue: {
    borderColor: colors.danger,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  body: {
    flex: 1,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  metaText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  overdueText: {
    color: colors.danger,
    fontWeight: '700',
  },
  deleteIcon: {
    fontSize: 16,
    marginLeft: spacing.sm,
    marginTop: 2,
  },
});
