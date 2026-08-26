import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  PanResponder,
  Alert,
} from 'react-native';
import { Task, Priority } from '../types';
import { radius, spacing, typography, fontFamilies } from '../theme/colors';
import { ThemePalette } from '../theme/colors';

interface Props {
  task: Task;
  theme: ThemePalette;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onPress: (task: Task) => void;
  dateLabel: string;
  timeLabel: string;
}

// Sentence Case helper: "Finish PROJECT" -> "Finish project", "prepare presentation" -> "Prepare presentation"
export const toSentenceCase = (text: string): string => {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const SwipeableTaskRow: React.FC<Props> = ({
  task,
  theme,
  onToggle,
  onDelete,
  onPress,
  dateLabel,
  timeLabel,
}) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const isSwipedOpen = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 15;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          pan.setValue({ x: Math.max(gestureState.dx, -90), y: 0 });
        } else if (isSwipedOpen.current && gestureState.dx > 0) {
          pan.setValue({ x: Math.min(-75 + gestureState.dx, 0), y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          Animated.spring(pan, {
            toValue: { x: -75, y: 0 },
            useNativeDriver: false,
            bounciness: 4,
          }).start();
          isSwipedOpen.current = true;
        } else {
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
            bounciness: 4,
          }).start();
          isSwipedOpen.current = false;
        }
      },
    })
  ).current;

  const closeSwipe = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
    isSwipedOpen.current = false;
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Delete Task',
      `Are you sure you want to delete "${toSentenceCase(task.title)}"?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: closeSwipe },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            closeSwipe();
            onDelete(task._id);
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority?: Priority) => {
    if (priority === 'high') return theme.priorityHigh;
    if (priority === 'medium') return theme.priorityMedium;
    return theme.priorityLow;
  };

  const pColor = getPriorityColor(task.priority);
  const titleSentenceCase = toSentenceCase(task.title);
  const hasValidDescription = task.description && task.description.trim().length > 0;

  let priorityLabel = 'Low';
  if (task.priority === 'high') priorityLabel = 'High';
  else if (task.priority === 'medium') priorityLabel = 'Medium';

  const deleteBgColor = theme.name === 'light' ? '#E03E3E' : '#EB5757';
  const deleteTextColor = '#FFFFFF';

  return (
    <View style={styles.rowContainer}>
      {/* Background Revealed Delete Action Button */}
      <View style={[styles.deleteActionContainer, { backgroundColor: deleteBgColor }]}>
        <TouchableOpacity
          style={styles.deleteActionBtn}
          onPress={handleDeletePress}
          activeOpacity={0.8}
        >
          <Text style={[styles.deleteActionText, { color: deleteTextColor }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Foreground Swipeable Task Row */}
      <Animated.View
        style={[
          styles.foregroundCard,
          {
            backgroundColor: theme.surface,
            transform: pan.getTranslateTransform(),
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          onPress={() => onToggle(task._id)}
          style={[
            styles.checkbox,
            { borderColor: pColor },
            task.completed && { backgroundColor: pColor, borderColor: pColor },
          ]}
          activeOpacity={0.7}
        >
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.taskBody}
          onPress={() => {
            if (isSwipedOpen.current) {
              closeSwipe();
            } else {
              onPress(task);
            }
          }}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.taskTitle,
              { color: theme.textPrimary },
              task.completed && { color: theme.textMuted, textDecorationLine: 'line-through' },
            ]}
          >
            {titleSentenceCase}
          </Text>

          {hasValidDescription ? (
            <Text style={[styles.taskDesc, { color: theme.textSecondary }]} numberOfLines={2}>
              {task.description}
            </Text>
          ) : null}

          <View style={styles.taskMetaRow}>
            <Text style={[styles.taskMetaText, { color: theme.textMuted }]}>
              {dateLabel} · {timeLabel}
            </Text>
            {task.category && task.category !== 'General' && (
              <>
                <Text style={[styles.metaSeparator, { color: theme.textMuted }]}>•</Text>
                <Text style={[styles.categoryBadge, { color: theme.textSecondary }]}>{task.category}</Text>
              </>
            )}
            <Text style={[styles.metaSeparator, { color: theme.textMuted }]}>•</Text>
            <View style={styles.priorityRow}>
              <View style={[styles.dotIndicator, { backgroundColor: pColor }]} />
              <Text style={[styles.priorityText, { color: pColor }]}>{priorityLabel}</Text>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    position: 'relative',
    marginVertical: 2,
  },
  deleteActionContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 75,
    borderRadius: radius.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteActionText: {
    ...typography.caption,
    fontFamily: fontFamilies.heading,
    fontSize: 12,
    fontWeight: '700',
  },
  foregroundCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm + 2,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    marginRight: spacing.md - 2,
    marginTop: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  taskBody: {
    flex: 1,
  },
  taskTitle: {
    fontFamily: fontFamilies.heading,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  taskDesc: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs + 1,
    gap: spacing.xs,
  },
  taskMetaText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
  },
  categoryBadge: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: '500',
  },
  metaSeparator: {
    fontSize: 10,
  },
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  priorityText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: '500',
  },
});
