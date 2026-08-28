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
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Tick01Icon,
  Delete02Icon,
  Briefcase01Icon,
  Activity01Icon,
  UserIcon,
  BookOpen01Icon,
  ShoppingBag01Icon,
  Folder01Icon,
  Clock01Icon,
} from '@hugeicons/core-free-icons';
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
  icon: any;
}

const CATEGORY_STYLES: Record<string, CategoryStyle> = {
  Work: {
    bg: '#FF5C6C', // Vibrant Coral Pink (Image 2)
    graphicColor: '#D93B4C',
    textColor: '#1F0508',
    subtextColor: '#4F111A',
    icon: Briefcase01Icon,
  },
  Personal: {
    bg: '#38D9A9', // Vibrant Mint Cyan (Image 2)
    graphicColor: '#14A37A',
    textColor: '#031F1A',
    subtextColor: '#0C4F43',
    icon: UserIcon,
  },
  Health: {
    bg: '#FFD15C', // Vibrant Golden Sunflower Yellow (Image 2)
    graphicColor: '#E09F00',
    textColor: '#1F1700',
    subtextColor: '#4F3C00',
    icon: Activity01Icon,
  },
  Study: {
    bg: '#4A7DFF', // Vibrant Electric Blue (Image 2)
    graphicColor: '#2248B8',
    textColor: '#FFFFFF',
    subtextColor: '#D0DDFF',
    icon: BookOpen01Icon,
  },
  Shopping: {
    bg: '#A066FF', // Vibrant Royal Purple
    graphicColor: '#7226D9',
    textColor: '#FFFFFF',
    subtextColor: '#E6D6FF',
    icon: ShoppingBag01Icon,
  },
  General: {
    bg: '#F5F6F8', // Crisp Off-White Card (Image 2)
    graphicColor: '#D0D4DC',
    textColor: '#1C2024',
    subtextColor: '#555E68',
    icon: Folder01Icon,
  },
};

const getCategoryStyle = (catName: string): CategoryStyle => {
  if (!catName || !catName.trim()) return CATEGORY_STYLES.General;
  const name = catName.trim();
  if (CATEGORY_STYLES[name]) return CATEGORY_STYLES[name];

  const lower = name.toLowerCase();
  if (lower.includes('work') || lower.includes('job') || lower.includes('office') || lower.includes('code') || lower.includes('dev') || lower.includes('presentation')) {
    return CATEGORY_STYLES.Work;
  }
  if (lower.includes('health') || lower.includes('gym') || lower.includes('fit') || lower.includes('care') || lower.includes('walk')) {
    return CATEGORY_STYLES.Health;
  }
  if (lower.includes('personal') || lower.includes('life') || lower.includes('home')) {
    return CATEGORY_STYLES.Personal;
  }
  if (lower.includes('study') || lower.includes('school') || lower.includes('read') || lower.includes('learn')) {
    return CATEGORY_STYLES.Study;
  }
  if (lower.includes('shop') || lower.includes('buy') || lower.includes('store')) {
    return CATEGORY_STYLES.Shopping;
  }

  return CATEGORY_STYLES.General;
};

const getCategoryIcon = (catName: string): any => {
  const style = getCategoryStyle(catName);
  if (style && style.icon) return style.icon;
  return Folder01Icon;
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
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 15;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          pan.setValue({ x: Math.max(gestureState.dx, -90), y: 0 });
        } else {
          pan.setValue({ x: Math.min(gestureState.dx, 100), y: 0 });
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -40) {
          Animated.spring(pan, {
            toValue: { x: -80, y: 0 },
            useNativeDriver: false,
            friction: 7,
            tension: 90,
          }).start();
          isSwipedOpen.current = true;
        } else if (gestureState.dx > 50) {
          onToggle(task._id);
          closeSwipe();
        } else {
          closeSwipe();
        }
      },
    })
  ).current;

  const categoryName = task.category && task.category.trim() ? task.category : 'General';
  const catStyle = getCategoryStyle(categoryName);
  const titleSentenceCase = toSentenceCase(task.title);
  const categoryIcon = getCategoryIcon(categoryName);

  const isCompleted = task.completed;

  // Completed tasks get a dulled dark/grey card surface with low opacity so active tasks pop in vibrant colors
  const cardBg = isCompleted
    ? (theme.isDark ? '#1E232B' : '#EAECEE')
    : catStyle.bg;

  const graphicColor = isCompleted
    ? (theme.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)')
    : catStyle.graphicColor;

  const textColor = isCompleted
    ? (theme.isDark ? '#768390' : '#6E7781')
    : catStyle.textColor;

  const subtextColor = isCompleted
    ? (theme.isDark ? '#545D68' : '#8C95A0')
    : catStyle.subtextColor;

  const checkboxBorder = isCompleted
    ? (theme.isDark ? '#444C56' : '#8C95A0')
    : catStyle.textColor;

  const checkboxBg = isCompleted
    ? (theme.isDark ? '#2D333B' : '#6E7781')
    : catStyle.textColor;

  const actionOpacity = pan.x.interpolate({
    inputRange: [-80, -10, 0],
    outputRange: [1, 0, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.rowContainer}>
      {/* Revealed Right Action (Swipe Left -> Delete, fades in ONLY during swipe) */}
      <Animated.View
        style={[
          styles.actionContainerRight,
          {
            backgroundColor: theme.priorityHigh,
            opacity: actionOpacity,
          },
        ]}
      >
        <TouchableOpacity style={styles.actionBtn} onPress={handleDeletePress} activeOpacity={0.8}>
          <HugeiconsIcon icon={Delete02Icon} size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Foreground Main Card */}
      <Animated.View
        style={[
          styles.foregroundCard,
          {
            backgroundColor: cardBg,
            borderColor: isCompleted ? (theme.isDark ? '#2D333B' : '#D0D7DE') : 'transparent',
            borderWidth: isCompleted ? 1 : 0,
            transform: pan.getTranslateTransform(),
          },
          shadows.sm,
        ]}
        {...panResponder.panHandlers}
      >
        {/* Right Side Large Category Vector Icon Graphic Accent */}
        <View style={styles.graphicIconContainer} pointerEvents="none">
          <View style={styles.largeCategoryIcon}>
            <HugeiconsIcon
              icon={categoryIcon}
              size={76}
              color={graphicColor}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={() => onToggle(task._id)}
          style={[
            styles.checkboxCircle,
            { borderColor: checkboxBorder },
            isCompleted && { backgroundColor: checkboxBg },
          ]}
          activeOpacity={0.7}
        >
          {isCompleted && (
            <HugeiconsIcon icon={Tick01Icon} size={13} color="#FFFFFF" />
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
              { color: textColor },
              isCompleted && { opacity: 0.7, textDecorationLine: 'line-through' },
            ]}
            numberOfLines={1}
          >
            {titleSentenceCase}
          </Text>

          {!!task.description && !!task.description.trim() && (
            <Text
              style={[
                styles.taskDescription,
                { color: subtextColor },
                isCompleted && { opacity: 0.6, textDecorationLine: 'line-through' },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {task.description.trim()}
            </Text>
          )}

          <View style={styles.taskMetaRow}>
            <View style={styles.clockIcon}>
              <HugeiconsIcon icon={Clock01Icon} size={12} color={subtextColor} />
            </View>
            <Text style={[styles.taskMetaText, { color: subtextColor }]}>
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
    right: 4,
    top: 2,
    bottom: 2,
    width: 66,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  actionBtn: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foregroundCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 24,
    minHeight: 84,
    position: 'relative',
    overflow: 'hidden',
  },
  graphicIconContainer: {
    position: 'absolute',
    right: -8,
    bottom: -10,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.4,
  },
  largeCategoryIcon: {
    transform: [{ rotate: '-10deg' }],
  },
  checkboxCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  taskBody: {
    flex: 1,
    paddingRight: 50,
    zIndex: 10,
  },
  taskTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 16,
    marginBottom: 2,
  },
  taskDescription: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    marginBottom: 4,
    opacity: 0.85,
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
  },
});
