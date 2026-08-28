import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/colors';
import { AppLogo } from '../components/AppLogo';

export const SplashScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 1500);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <AppLogo
        size={38}
        containerSize={68}
        backgroundColor={colors.primary}
        color={colors.onPrimary}
        borderRadius={radius.sm}
        containerStyle={{ marginBottom: spacing.md }}
      />
      <Text style={styles.appName}>DailyLoop</Text>
      <Text style={styles.tagline}>Plan less. Do more.</Text>
      <ActivityIndicator size="small" color={colors.textSecondary} style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoMark: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.onPrimary,
  },
  appName: {
    ...typography.displayLarge,
    color: colors.textPrimary,
  },
  tagline: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  loader: {
    position: 'absolute',
    bottom: 60,
  },
});
