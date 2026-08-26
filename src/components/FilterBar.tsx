import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { FilterMode, SortMode } from '../types';

interface Props {
  filterMode: FilterMode;
  sortMode: SortMode;
  onFilterChange: (mode: FilterMode) => void;
  onSortChange: (mode: SortMode) => void;
}

const FILTERS: { key: FilterMode; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Done' },
];

const SORTS: { key: SortMode; label: string }[] = [
  { key: 'smart', label: 'Smart' },
  { key: 'deadline', label: 'Deadline' },
  { key: 'priority', label: 'Priority' },
  { key: 'dateTime', label: 'Scheduled' },
];

const Chip: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({
  label,
  active,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.chip, active && styles.chipActive]}
    activeOpacity={0.8}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

export const FilterBar: React.FC<Props> = ({
  filterMode,
  sortMode,
  onFilterChange,
  onSortChange,
}) => {
  return (
    <View>
      <View style={styles.row}>
        {FILTERS.map((f) => (
          <Chip
            key={f.key}
            label={f.label}
            active={filterMode === f.key}
            onPress={() => onFilterChange(f.key)}
          />
        ))}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={{ paddingRight: spacing.md }}
      >
        <Text style={styles.sortLabel}>Sort:</Text>
        {SORTS.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            active={sortMode === s.key}
            onPress={() => onSortChange(s.key)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  sortScroll: {
    marginBottom: spacing.md,
  },
  sortLabel: {
    color: colors.textMuted,
    fontSize: 12,
    alignSelf: 'center',
    marginRight: spacing.sm,
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginRight: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: colors.accent,
  },
});
