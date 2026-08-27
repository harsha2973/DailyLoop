import React, { useEffect, useRef } from 'react';
import {
  Animated,
  LayoutAnimation,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, shadows, fontFamilies } from '../theme/colors';
import { FilterMode, SortMode } from '../types';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  filterMode: FilterMode;
  sortMode: SortMode;
  onFilterChange: (mode: FilterMode) => void;
  onSortChange: (mode: SortMode) => void;
}

const FILTERS: { key: FilterMode; label: string; icon: string }[] = [
  { key: 'active', label: 'To do', icon: 'disc' },
  { key: 'completed', label: 'Completed', icon: 'check-circle' },
  { key: 'all', label: 'All Tasks', icon: 'list' },
];

const AnimatedFilterItem: React.FC<{
  filter: { key: FilterMode; label: string; icon: string };
  active: boolean;
  onPress: () => void;
  theme: any;
}> = ({ filter, active, onPress, theme }) => {
  const anim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: active ? 1 : 0,
      useNativeDriver: false,
      friction: 7,
      tension: 100,
    }).start();
  }, [active, anim]);

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.96, 1],
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={styles.pillItemWrapper}
    >
      <Animated.View
        style={[
          styles.pillItem,
          {
            transform: [{ scale }],
            backgroundColor: active ? theme.primaryButton : 'transparent',
          },
          active && shadows.sm,
        ]}
      >
        <Icon
          name={filter.icon}
          size={14}
          color={active ? theme.primaryButtonText : theme.textSecondary}
          style={styles.pillIcon}
        />
        <Text
          style={[
            styles.pillText,
            { color: active ? theme.primaryButtonText : theme.textSecondary },
            active && styles.pillTextActive,
          ]}
        >
          {filter.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const FilterBar: React.FC<Props> = ({
  filterMode,
  onFilterChange,
}) => {
  const { theme } = useTheme();

  const handleSelect = (key: FilterMode) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onFilterChange(key);
  };

  return (
    <View
      style={[
        styles.pillContainer,
        { backgroundColor: theme.surfaceSecondary, borderColor: theme.border },
      ]}
    >
      {FILTERS.map((f) => {
        const active = filterMode === f.key;

        return (
          <AnimatedFilterItem
            key={f.key}
            filter={f}
            active={active}
            onPress={() => handleSelect(f.key)}
            theme={theme}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  pillContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.pill,
    padding: 5,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  pillItemWrapper: {
    flex: 1,
  },
  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
  },
  pillIcon: {
    marginRight: 6,
  },
  pillText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: '500',
  },
  pillTextActive: {
    fontWeight: '700',
  },
});
