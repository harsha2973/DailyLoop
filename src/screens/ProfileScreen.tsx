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
import Icon from 'react-native-vector-icons/Feather';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import { useTasks } from '../context/TaskContext';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';
import { Priority, SortMode } from '../types';

export const ProfileScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { mode, theme, setMode } = useTheme();
  const { defaultPriority, defaultSorting, setDefaultPriority, setDefaultSorting } = useTasks();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleBackPress = () => {
    if (navigation) {
      if (navigation.canGoBack && navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Main');
      }
    }
  };

  const confirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of DailyLoop?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const handleEditProfile = () => {
    if (navigation) {
      navigation.navigate('EditProfile');
    }
  };

  const handleChangePassword = () => {
    if (navigation) {
      navigation.navigate('ChangePassword');
    }
  };

  const handleCyclePriority = () => {
    const cycleMap: Record<Priority, Priority> = {
      high: 'medium',
      medium: 'low',
      low: 'high',
    };
    const nextPriority = cycleMap[defaultPriority] || 'medium';
    setDefaultPriority(nextPriority);
  };

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
      <View style={[styles.topNavHeader, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backBtn} activeOpacity={0.7}>
          <Icon name="arrow-left" size={20} color={theme.textPrimary} />
          <Text style={[styles.backText, { color: theme.textPrimary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* User Card */}
        <TouchableOpacity
          style={[styles.userCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}
          onPress={handleEditProfile}
          activeOpacity={0.8}
        >
          <View style={[styles.avatarBox, { backgroundColor: theme.primaryButton }]}>
            <Text style={[styles.avatarText, { color: theme.primaryButtonText }]}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'H'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.name || 'Harsha Gowda'}</Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>{user?.email || 'harsha@example.com'}</Text>
          </View>
        </TouchableOpacity>

        {/* Visual Theme Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>VISUAL THEMES</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.sm]}>
            <TouchableOpacity
              style={styles.themeOptionRow}
              onPress={() => setMode('dark')}
              activeOpacity={0.8}
            >
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Dark Theme</Text>
              {mode === 'dark' && <Text style={[styles.checkActive, { color: theme.accent }]}>✓</Text>}
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity
              style={styles.themeOptionRow}
              onPress={() => setMode('light')}
              activeOpacity={0.8}
            >
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Light Theme</Text>
              {mode === 'light' && <Text style={[styles.checkActive, { color: theme.accent }]}>✓</Text>}
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.textMuted }]}>ACCOUNT</Text>
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.sm]}>
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
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.sm]}>
            <View style={styles.menuItemRow}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Notifications</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.border, true: theme.accentMuted }}
                thumbColor={notificationsEnabled ? theme.accent : theme.textMuted}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <TouchableOpacity style={styles.menuItem} onPress={handleCyclePriority} activeOpacity={0.7}>
              <Text style={[styles.menuText, { color: theme.textPrimary }]}>Default Priority</Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>
                {priorityLabelMap[defaultPriority] || 'Medium'} ›
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

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
          <View style={[styles.menuCard, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.sm]}>
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
          style={[styles.logoutBtn, { backgroundColor: theme.priorityHighBg, borderColor: theme.border }, shadows.sm]}
          onPress={confirmLogout}
          activeOpacity={0.85}
        >
          <Text style={[styles.logoutBtnText, { color: theme.priorityHigh }]}>Sign Out</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: 6,
  },
  backText: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 60,
  },
  container: {
    paddingHorizontal: spacing.containerPadding,
    paddingTop: spacing.md,
    paddingBottom: 110,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.xl, // 32px curved radius
    padding: spacing.lg,
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
    fontFamily: fontFamilies.body,
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: fontFamilies.headingBold,
    fontSize: 18,
    fontWeight: '600',
  },
  userEmail: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    fontFamily: fontFamilies.body,
    fontSize: 11,
    marginBottom: spacing.xs,
    letterSpacing: 0.8,
    fontWeight: '500',
  },
  menuCard: {
    borderRadius: radius.lg, // 24px curved radius
    borderWidth: 1,
  },
  themeOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  menuText: {
    fontFamily: fontFamilies.body,
    fontSize: 14,
  },
  checkActive: {
    fontSize: 16,
    fontWeight: '700',
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
    fontFamily: fontFamilies.body,
    fontSize: 13,
  },
  chevron: {
    fontSize: 16,
  },
  divider: {
    height: 1,
  },
  logoutBtn: {
    height: 50,
    borderRadius: radius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginTop: spacing.md,
  },
  logoutBtnText: {
    fontFamily: fontFamilies.body,
    fontSize: 15,
    fontWeight: '600',
  },
});
