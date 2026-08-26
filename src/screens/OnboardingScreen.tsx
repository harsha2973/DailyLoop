import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { colors, radius, spacing, typography } from '../theme/colors';

const { width } = Dimensions.get('window');

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      {/* Upper Task Preview Section */}
      <View style={styles.visualSection}>
        <View style={styles.overviewCard}>
          <Text style={styles.cardHeader}>Today's Overview</Text>

          <View style={styles.taskItem}>
            <View style={[styles.checkboxOutline, styles.checkboxDone]}>
              <Text style={styles.checkmarkText}>✓</Text>
            </View>
            <Text style={[styles.taskText, styles.taskDoneText]}>Morning workout</Text>
          </View>

          <View style={styles.taskItem}>
            <View style={styles.checkboxOutline} />
            <Text style={styles.taskText}>Review project</Text>
          </View>

          <View style={styles.taskItem}>
            <View style={styles.checkboxOutline} />
            <Text style={styles.taskText}>Plan tomorrow</Text>
          </View>
        </View>
      </View>

      {/* Bottom Content Card */}
      <View style={styles.bottomSection}>
        <Text style={styles.title}>Your day, organized.</Text>
        <Text style={styles.description}>
          A simple, focused way to plan tasks, track progress, and stay consistent.
        </Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.secondaryLink}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryLinkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  visualSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding, // 24dp
    backgroundColor: colors.background,
  },
  overviewCard: {
    width: width - 48,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    ...typography.title,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  checkboxOutline: {
    width: 20,
    height: 20,
    borderRadius: radius.xs,
    borderWidth: 1.5,
    borderColor: colors.outline,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.statusCompleted,
    borderColor: colors.statusCompleted,
  },
  checkmarkText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  taskText: {
    ...typography.body,
    fontSize: 15,
    color: colors.textPrimary,
    flex: 1,
  },
  taskDoneText: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  bottomSection: {
    backgroundColor: colors.backgroundSecondary,
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.containerPadding, // 24dp
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 1.5,
    alignItems: 'center',
  },
  title: {
    ...typography.displayLarge,
    fontSize: 26,
    color: colors.textPrimary,
    marginBottom: spacing.xs + 2,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 21,
  },
  primaryButton: {
    width: '100%',
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    ...typography.title,
    color: colors.onPrimary,
    fontSize: 15,
  },
  secondaryLink: {
    paddingVertical: spacing.xs,
  },
  secondaryLinkText: {
    ...typography.bodySm,
    color: colors.textSecondary,
  },
});
