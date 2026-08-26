import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { radius, spacing, typography } from '../theme/colors';
import { Priority, SortMode } from '../types';

export const ProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { mode, theme, setMode } = useTheme();
  const { defaultPriority, defaultSorting, setDefaultPriority, setDefaultSorting } = useTasks();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const confirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of DailyLoop?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      `Account Name: ${user?.name || 'Harsha Gowda'}\nEmail: ${user?.email || 'harsha@example.com'}`,
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const handleChangePassword = () => {
    Alert.alert(
      'Change Password',
      'Would you like to send a password reset link to your registered email address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reset Link',
          onPress: () =>
            Alert.alert('Email Sent', 'Password reset instructions have been sent to your email.'),
        },
      ]
    );
  };

  // Silent cycle Priority without alert dialog: High -> Medium -> Low -> High
  const handleCyclePriority = () => {
    const cycleMap: Record<Priority, Priority> = {
      high: 'medium',
      medium: 'low',
      low: 'high',
    };
    const nextPriority = cycleMap[defaultPriority] || 'medium';
    setDefaultPriority(nextPriority);
  };

  // Silent cycle Sorting without alert dialog: Smart -> Time -> Priority -> Smart
  const handleCycleSorting = () => {
    const cycleMap: Record<string, SortMode> = {
      smart: 'dateTime',
      dateTime: 'priority',
      priority: 'smart',
      deadline: 'smart',
    };
    const nextSort = cycleMap[defaultSorting] || 'smart';
    setDefaultSorting(nextSort);
  };

  const priorityLabelMap: Record<Priority, string> = {
    high: 'High',
    medium: 'Medium',
    low: 'Low',
  };

  const sortingLabelMap: Record<string, string> = {
    smart: 'Smart',
    dateTime: 'Time',
    priority: 'Priority',
    deadline: 'Time',
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]}>
      {/* Top Back Navigation Bar */}
      {navigation && (
        <View style={[styles.topNavHeader, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backText, { color: theme.textSecondary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Profile</Text>
          <View style={styles.headerSpacer} />
        </View>
      )}

      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <TouchableOpacity
          style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleEditProfile}
          activeOpacity={0.8}
        >
          <View style={[styles.avatarBox, { backgroundColor: theme.primary }]}>
            <Text style={[styles.avatarText, { color: theme.onPrimary }]}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.name || 'Harsha Gowda'}</Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || 'harsha@example.com'}</Text>
          </View>
        </TouchableOpacity>

        {/* Visual Theme Selector (Dark & Light) */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>VISUAL THEMES</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {/* Option 1: Dark */}
            <TouchableOpacity
              style={styles.themeOptionRow}
              onPress={() => setMode('dark')}
              activeOpacity={0.8}
            >
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Dark</Text>
              {mode === 'dark' && <Text style={[styles.checkActive, { color: theme.primary }]}>✓</Text>}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Option 2: Light */}
            <TouchableOpacity
              style={styles.themeOptionRow}
              onPress={() => setMode('light')}
              activeOpacity={0.8}
            >
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Light</Text>
              {mode === 'light' && <Text style={[styles.checkActive, { color: theme.primary }]}>✓</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>ACCOUNT</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TouchableOpacity style={styles.menuItem} onPress={handleEditProfile} activeOpacity={0.7}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Edit Profile</Text>
              <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={handleChangePassword} activeOpacity={0.7}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Change Password</Text>
              <Text style={[styles.chevron, { color: theme.textMuted }]}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>PREFERENCES</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.menuItemRow}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.border, true: theme.priorityLow }}
                thumbColor={theme.primary}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Silent Cycle Default Priority */}
            <TouchableOpacity style={styles.menuItem} onPress={handleCyclePriority} activeOpacity={0.7}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Default Priority</Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>
                {priorityLabelMap[defaultPriority] || 'Medium'} ›
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Silent Cycle Default Sorting */}
            <TouchableOpacity style={styles.menuItem} onPress={handleCycleSorting} activeOpacity={0.7}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Default Sorting</Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>
                {sortingLabelMap[defaultSorting] || 'Smart'} ›
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>ABOUT</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.menuItemRow}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Version</Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>DailyLoop 1.0.0</Text>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.menuItemRow}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Tagline</Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>Plan less. Do more.</Text>
            </View>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={[styles.logoutBtn, { backgroundColor: theme.priorityHighBg, borderColor: 'rgba(235, 87, 87, 0.3)' }]}
          onPress={confirmLogout}
          activeOpacity={0.85}
        >
          <Text style={[styles.logoutBtnText, { color: theme.priorityHighText }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topNavHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.containerPadding,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: spacing.xs,
  },
  backText: {
    ...typography.bodySm,
    fontSize: 14,
  },
  headerTitle: {
    ...typography.title,
    fontSize: 16,
  },
  headerSpacer: {
    width: 48,
  },
  container: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.md,
    paddingBottom: 110,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.title,
    fontSize: 17,
  },
  userEmail: {
    ...typography.bodySm,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    ...typography.caption,
    fontSize: 11,
    marginBottom: spacing.sm,
    letterSpacing: 0.8,
  },
  menuCard: {
    borderRadius: radius.md,
    borderWidth: 1,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  menuText: {
    ...typography.body,
    fontSize: 15,
  },
  checkActive: {
    fontSize: 18,
    fontWeight: '800',
    marginLeft: spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  menuValue: {
    ...typography.bodySm,
  },
  chevron: {
    fontSize: 18,
  },
  divider: {
    height: 1,
  },
  logoutBtn: {
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginTop: spacing.md,
  },
  logoutBtnText: {
    ...typography.title,
    fontSize: 15,
  },
});
