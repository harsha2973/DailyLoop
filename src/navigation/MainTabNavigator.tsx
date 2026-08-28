import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  Analytics01Icon,
  Calendar01Icon,
  Add01Icon,
} from '@hugeicons/core-free-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { InsightsScreen } from '../screens/InsightsScreen';
import { CalendarScreen } from '../screens/CalendarScreen';
import { useTheme } from '../theme/ThemeContext';
import { radius, spacing, fontFamilies, shadows } from '../theme/colors';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const MainTabNavigator: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'insights' | 'calendar'>('home');
  const { theme } = useTheme();

  const handleTabChange = (tab: 'home' | 'insights' | 'calendar') => {
    if (tab !== activeTab) {
      LayoutAnimation.configureNext({
        duration: 220,
        create: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
        update: {
          type: LayoutAnimation.Types.easeInEaseOut,
          springDamping: 0.8,
        },
        delete: {
          type: LayoutAnimation.Types.easeInEaseOut,
          property: LayoutAnimation.Properties.opacity,
        },
      });
      setActiveTab(tab);
    }
  };

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
            style={[styles.tabItem, activeTab === 'home' && { backgroundColor: theme.primaryButton }]}
            onPress={() => handleTabChange('home')}
            activeOpacity={0.8}
          >
            <View style={activeTab === 'home' ? styles.tabIconActive : undefined}>
              <HugeiconsIcon
                icon={Home01Icon}
                size={18}
                color={activeTab === 'home' ? theme.primaryButtonText : theme.textMuted}
              />
            </View>
            {activeTab === 'home' && (
              <Text style={[styles.tabText, { color: theme.primaryButtonText }]}>Home</Text>
            )}
          </TouchableOpacity>

          {/* Insights Tab */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'insights' && { backgroundColor: theme.primaryButton }]}
            onPress={() => handleTabChange('insights')}
            activeOpacity={0.8}
          >
            <View style={activeTab === 'insights' ? styles.tabIconActive : undefined}>
              <HugeiconsIcon
                icon={Analytics01Icon}
                size={18}
                color={activeTab === 'insights' ? theme.primaryButtonText : theme.textMuted}
              />
            </View>
            {activeTab === 'insights' && (
              <Text style={[styles.tabText, { color: theme.primaryButtonText }]}>Insights</Text>
            )}
          </TouchableOpacity>

          {/* Calendar Tab */}
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'calendar' && { backgroundColor: theme.primaryButton }]}
            onPress={() => handleTabChange('calendar')}
            activeOpacity={0.8}
          >
            <View style={activeTab === 'calendar' ? styles.tabIconActive : undefined}>
              <HugeiconsIcon
                icon={Calendar01Icon}
                size={18}
                color={activeTab === 'calendar' ? theme.primaryButtonText : theme.textMuted}
              />
            </View>
            {activeTab === 'calendar' && (
              <Text style={[styles.tabText, { color: theme.primaryButtonText }]}>Calendar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Floating Add Task Circular FAB (+) */}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primaryButton }, shadows.md]}
          onPress={() => navigation.navigate('AddEditTask')}
          activeOpacity={0.85}
        >
          <HugeiconsIcon icon={Add01Icon} size={24} color={theme.primaryButtonText} />
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
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  tabIconActive: {
    marginRight: 6,
  },
  tabText: {
    fontFamily: fontFamilies.body,
    fontSize: 13,
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
