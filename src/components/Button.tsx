import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme/colors';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<Props> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.accent : colors.background} />
      ) : (
        <Text
          style={[
            styles.label,
            variant === 'ghost' && { color: colors.accent },
            variant === 'danger' && { color: '#FFF' },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.accent,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    ...typography.body,
    fontWeight: '700',
    color: colors.background,
  },
});
