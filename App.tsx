/**
 * DailyLoop Productivity Suite — Root Component
 */
import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </>
  );
};

function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
