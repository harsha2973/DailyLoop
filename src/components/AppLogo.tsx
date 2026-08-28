import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Infinity01Icon } from '@hugeicons/core-free-icons';

interface AppLogoProps {
  size?: number;
  color?: string;
  containerStyle?: ViewStyle;
  showContainer?: boolean;
  containerSize?: number;
  backgroundColor?: string;
  borderRadius?: number;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 32,
  color = '#FFFFFF',
  containerStyle,
  showContainer = true,
  containerSize,
  backgroundColor,
  borderRadius = 10,
}) => {
  const iconSize = size;
  const boxSize = containerSize || size * 1.7;

  if (!showContainer) {
    return (
      <View style={[styles.iconOnlyContainer, containerStyle]}>
        <HugeiconsIcon icon={Infinity01Icon} size={iconSize} color={color} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          width: boxSize,
          height: boxSize,
          borderRadius: borderRadius,
          backgroundColor: backgroundColor || '#4F46E5',
        },
        containerStyle,
      ]}
    >
      <HugeiconsIcon icon={Infinity01Icon} size={iconSize} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconOnlyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
