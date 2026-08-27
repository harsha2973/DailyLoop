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
import Icon from 'react-native-vector-icons/Feather';
import { Task, Priority } from '../types';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';
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

export const toSentenceCase = (text: string): string => {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

interface CategoryStyle {
  bg: string;
  graphicColor: string;
  textColor: string;
  subtextColor: string;
  badgeBg: string;
  shapeType: 'trapezoid' | 'flower' | 'arc' | 'polygon' | 'badge';
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Work: {
    bg: '#FFB8B3', // Pastel Coral
    graphicColor: '#FF6B6B',
    textColor: '#2D1210',
    subtextColor: '#5E2B27',
    badgeBg: 'rgba(255, 255, 255, 0.75)',
    shapeType: 'flower',
  },
  Personal: {
    bg: '#8EE0CA', // Pastel Mint
    graphicColor: '#36B395',
    textColor: '#0A2D23',
    subtextColor: '#154A3B',
    badgeBg: 'rgba(255, 255, 255, 0.75)',
    shapeType: 'arc',
  },
  Health: {
    bg: '#FFF099', // Pastel Yellow
    graphicColor: '#F5C724',
    textColor: '#2B2508',
    subtextColor: '#544910',
    badgeBg: 'rgba(255, 255, 255, 0.75)',
    shapeType: 'polygon',
  },
  Study: {
    bg: '#2F3842', // Dark Charcoal Slate
    graphicColor: '#4A72B8',
    textColor: '#FFFFFF',
    subtextColor: '#B0C2DE',
    badgeBg: 'rgba(255, 255, 255, 0.2)',
    shapeType: 'badge',
  },
  General: {
    bg: '#F5F4EE', // Off-White Ivory
    graphicColor: '#D8D4C8',
    textColor: '#1C1A17',
    subtextColor: '#5C584E',
    badgeBg: 'rgba(0, 0, 0, 0.06)',
    shapeType: 'trapezoid',
  },
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

  const closeSwipe = () => {
    Animated.spring(pan, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
      friction: 8,
      tension: 100,
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

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 15;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          pan.setValue({ x: Math.max(gestureState.dx, -90), y: 0 });
        } else {
          pan.setValue({ x: Math.min(gestureState.dx, 100), y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -45) {
          // Swiped Left -> Remain open showing Delete action button
          Animated.spring(pan, {
            toValue: { x: -80, y: 0 },
            useNativeDriver: false,
            friction: 7,
            tension: 90,
          }).start();
          isSwipedOpen.current = true;
        } else if (gestureState.dx > 50) {
          // Swiped Right -> Mark as complete directly without showing icon, then snap back
          onToggle(task._id);
          closeSwipe();
        } else {
          closeSwipe();
        }
      },
    })
  ).current;

  const categoryName = task.category && task.category.trim() ? task.category : 'General';
  const catStyle = CATEGORY_STYLES[categoryName] || CATEGORY_STYLES.General;
  const titleSentenceCase = toSentenceCase(task.title);

  return (
    <View style={styles.rowContainer}>
      {/* Revealed Right Action (Swipe Left -> Delete) */}
      <View style={[styles.actionContainerRight, { backgroundColor: theme.priorityHigh }]}>
        <TouchableOpacity style={styles.actionBtn} onPress={handleDeletePress} activeOpacity={0.8}>
          <Icon name="trash-2" size={20} color="#FFFFFF" />
          <Text style={[styles.actionText, { color: '#FFFFFF' }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Foreground Task Card with Category Color & Abstract Geometric Accents */}
      <Animated.View
        style={[
          styles.foregroundCard,
          {
            backgroundColor: catStyle.bg,
            transform: pan.getTranslateTransform(),
          },
          shadows.sm,
        ]}
        {...panResponder.panHandlers}
      >
        {/* Right Side Abstract Geometric Graphic Accent matching Reference Screenshots */}
        <View style={styles.graphicClipContainer}>
          <View
            style={[
              styles.geometricShape,
              { backgroundColor: catStyle.graphicColor },
              catStyle.shapeType === 'flower' && styles.shapeFlower,
              catStyle.shapeType === 'arc' && styles.shapeArc,
              catStyle.shapeType === 'polygon' && styles.shapePolygon,
              catStyle.shapeType === 'badge' && styles.shapeBadge,
            ]}
          />
        </View>

        {/* Top Right Category Pill Badge */}
        <View style={[styles.topRightBadge, { backgroundColor: catStyle.badgeBg }]}>
          <Text style={[styles.topRightBadgeText, { color: catStyle.textColor }]}>
            {categoryName}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => onToggle(task._id)}
          style={[
            styles.checkboxCircle,
            { borderColor: catStyle.textColor },
            task.completed && { backgroundColor: catStyle.textColor },
          ]}
          activeOpacity={0.7}
        >
          {task.completed && (
            <Icon name="check" size={13} color={catStyle.bg} />
          )}
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
              { color: catStyle.textColor },
              task.completed && { opacity: 0.6, textDecorationLine: 'line-through' },
            ]}
          >
            {titleSentenceCase}
          </Text>

          <View style={styles.taskMetaRow}>
            <Icon name="clock" size={12} color={catStyle.subtextColor} style={styles.clockIcon} />
            <Text style={[styles.taskMetaText, { color: catStyle.subtextColor }]}>
              {dateLabel} · {timeLabel}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    position: 'relative',
    marginVertical: 6,
  },
  actionContainerRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
  },
  actionText: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: '700',
  },
  foregroundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: 24, // High rounded corners matching reference screenshot
    minHeight: 88,
    position: 'relative',
    overflow: 'hidden',
  },
  graphicClipContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 120,
    overflow: 'hidden',
  },
  geometricShape: {
    position: 'absolute',
    right: -15,
    bottom: -15,
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  shapeFlower: {
    borderRadius: 35,
    transform: [{ rotate: '45deg' }],
  },
  shapeArc: {
    borderRadius: 50,
    borderTopLeftRadius: 0,
  },
  shapePolygon: {
    borderRadius: 16,
    transform: [{ rotate: '25deg' }],
  },
  shapeBadge: {
    borderRadius: 20,
    opacity: 0.8,
  },
  topRightBadge: {
    position: 'absolute',
    top: 12,
    right: 14,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: radius.pill,
    zIndex: 10,
  },
  topRightBadgeText: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: '600',
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12, // Perfect circle matching reference image
    borderWidth: 1.5,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  taskBody: {
    flex: 1,
    paddingRight: 60, // Space for right graphic accent
    zIndex: 10,
  },
  taskTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    marginRight: 4,
  },
  taskMetaText: {
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: '500',
  },
});
