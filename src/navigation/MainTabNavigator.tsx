import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, typography } from '../theme/colors';

export const MainTabNavigator: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = React.useState<'home' | 'insights' | 'calendar'>('home');
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Active Screen View */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && <HomeScreen navigation={navigation} />}
        {activeTab === 'insights' && <InsightsScreen navigation={navigation} />}
        {activeTab === 'calendar' && <CalendarScreen navigation={navigation} />}
      </View>

      {/* 3-Tab Bottom Navigation Bar */}
      <SafeAreaView pointerEvents="box-none" style={styles.floatingNavContainer}>
        <View style={[styles.bottomBar, { backgroundColor: theme.navBackground, borderColor: theme.border }]}>
          {/* Home Tab */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'home' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'home' && { color: theme.onPrimary }]}>
              Home
            </Text>
          </TouchableOpacity>

          {/* Insights Tab */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'insights' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab('insights')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'insights' && { color: theme.onPrimary }]}>
              Insights
            </Text>
          </TouchableOpacity>

          {/* Calendar Tab */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'calendar' && { backgroundColor: theme.primary }]}
            onPress={() => setActiveTab('calendar')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: theme.textSecondary }, activeTab === 'calendar' && { color: theme.onPrimary }]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Floating Add Task FAB (+ New) */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primaryButton, borderColor: theme.border }]}
          onPress={() => navigation.navigate('AddEditTask')}
          activeOpacity={0.85}
        >
          <Text style={[styles.fabText, { color: theme.primaryButtonText }]}>+ New</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
  floatingNavContainer: {
    position: 'absolute',
    bottom: 18,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.containerPadding, // 24dp
    gap: 10,
  },
  bottomBar: {
    flex: 1,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  tabItem: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: radius.sm,
  },
  tabText: {
    ...typography.caption,
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    height: 50,
    paddingHorizontal: 18,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  fabText: {
    ...typography.title,
    fontSize: 13,
    fontWeight: '700',
  },
});
