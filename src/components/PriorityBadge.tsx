import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { Priority } from '../types';

const CONFIG: Record<Priority, { label: string; color: string }> = {
  high: { label: 'HIGH', color: colors.priorityHigh },
  medium: { label: 'MED', color: colors.priorityMedium },
  low: { label: 'LOW', color: colors.priorityLow },
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const { label, color } = CONFIG[priority];
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
