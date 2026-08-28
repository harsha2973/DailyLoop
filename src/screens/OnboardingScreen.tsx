import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { CheckmarkCircle01Icon, Clock01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';

const { width } = Dimensions.get('window');

export const OnboardingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Upper Task Preview Section */}
      <View style={styles.visualSection}>
        <View style={[styles.overviewCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.lg]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardHeader, { color: theme.textPrimary }]}>Today's Overview</Text>
            <Text style={styles.emojiBadge}>😍</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>To do</Text>
          <View style={styles.taskItem}>
            <View style={[styles.checkboxOutline, { backgroundColor: theme.accent, borderColor: theme.accent }]}>
              <HugeiconsIcon icon={Tick01Icon} size={10} color="#FFFFFF" />
            </View>
            <Text style={[styles.taskText, { color: theme.textPrimary }]}>Morning workout</Text>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Completed</Text>
          <View style={styles.taskItem}>
            <View style={[styles.checkboxOutline, { backgroundColor: theme.statusCompleted, borderColor: theme.statusCompleted }]}>
              <HugeiconsIcon icon={Tick01Icon} size={10} color="#FFFFFF" />
            </View>
            <Text style={[styles.taskText, { color: theme.textMuted, textDecorationLine: 'line-through' }]}>
              Drink water
            </Text>
          </View>

          <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Pending</Text>
          <View style={styles.taskItem}>
            <View style={[styles.checkboxOutline, { borderColor: theme.borderStrong }]}>
              <HugeiconsIcon icon={Clock01Icon} size={10} color={theme.textMuted} />
            </View>
            <Text style={[styles.taskText, { color: theme.textPrimary }]}>Evening walk</Text>
          </View>
        </View>
      </View>

      {/* Bottom Content Card */}
      <View style={[styles.bottomSection, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.lg]}>
        <View style={[styles.iconBadge, { backgroundColor: theme.surfaceSecondary }]}>
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={32} color={theme.textPrimary} />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>Welcome to DailyLoop!</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          A simple, joyful way to take control of your time and routines.
        </Text>

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primaryButton }, shadows.sm]}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={[styles.primaryButtonText, { color: theme.primaryButtonText }]}>Get Started</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.secondaryLink}
          activeOpacity={0.7}
        >
          <Text style={[styles.secondaryLinkText, { color: theme.textSecondary }]}>
            Already a user? <Text style={{ color: theme.textPrimary, fontWeight: '600' }}>Log in</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  visualSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.containerPadding,
  },
  overviewCard: {
    width: width - 56,
    borderRadius: radius.xl, // 32px curved radius
    padding: spacing.lg,
    borderWidth: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  cardHeader: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 18,
  },
  emojiBadge: {
    fontSize: 20,
  },
  sectionLabel: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    marginTop: spacing.xs,
    marginBottom: 4,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  checkboxOutline: {
    width: 18,
    height: 18,
    borderRadius: 6,
    borderWidth: 1.2,
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    fontSize: 10,
    color: '#FFFFFF',
  },
  taskText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    flex: 1,
  },
  bottomSection: {
    borderTopLeftRadius: radius.xl * 1.2, // 36px curved radius
    borderTopRightRadius: radius.xl * 1.2,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl * 1.5,
    alignItems: 'center',
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 24,
    marginBottom: spacing.xs + 2,
    textAlign: 'center',
  },
  description: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 19,
    paddingHorizontal: spacing.md,
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: radius.pill, // Curved pill button
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 15,
  },
  secondaryLink: {
    paddingVertical: spacing.xs,
  },
  secondaryLinkText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
  },
});
