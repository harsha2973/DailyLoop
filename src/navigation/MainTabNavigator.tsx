import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';

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

      {/* Floating Bottom Navigation Bar */}
      <SafeAreaView pointerEvents="box-none" style={styles.floatingNavContainer}>
        <View style={[styles.bottomBar, { backgroundColor: theme.surface, borderColor: theme.border }, shadows.md]}>
          {/* Home Tab */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'home' && { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.8}
          >
            <Icon
              name="home"
              size={16}
              color={activeTab === 'home' ? theme.textPrimary : theme.textMuted}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'home' ? theme.textPrimary : theme.textMuted },
                activeTab === 'home' && styles.tabTextActive,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          {/* Insights Tab */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'insights' && { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => setActiveTab('insights')}
            activeOpacity={0.8}
          >
            <Icon
              name="bar-chart-2"
              size={16}
              color={activeTab === 'insights' ? theme.textPrimary : theme.textMuted}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'insights' ? theme.textPrimary : theme.textMuted },
                activeTab === 'insights' && styles.tabTextActive,
              ]}
            >
              Insights
            </Text>
          </TouchableOpacity>

          {/* Calendar Tab */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'calendar' && { backgroundColor: theme.surfaceSecondary }]}
            onPress={() => setActiveTab('calendar')}
            activeOpacity={0.8}
          >
            <Icon
              name="calendar"
              size={16}
              color={activeTab === 'calendar' ? theme.textPrimary : theme.textMuted}
              style={styles.tabIcon}
            />
            <Text
              style={[
                styles.tabText,
                { color: activeTab === 'calendar' ? theme.textPrimary : theme.textMuted },
                activeTab === 'calendar' && styles.tabTextActive,
              ]}
            >
              Calendar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Floating Add Task Circular FAB (+) */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primaryButton }, shadows.md]}
          onPress={() => navigation.navigate('AddEditTask')}
          activeOpacity={0.85}
        >
          <Text style={[styles.fabText, { color: theme.primaryButtonText }]}>+</Text>
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
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.containerPadding,
    gap: 12,
  },
  bottomBar: {
    flex: 1,
    height: 54,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
    fontWeight: '500',
  },
  tabTextActive: {
    fontWeight: '600',
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    fontFamily: fontFamilies.body,
    fontSize: 26,
    fontWeight: '400',
    marginTop: -2,
  },
});
