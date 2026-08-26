import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  darkTheme,
  lightTheme,
  ThemePalette,
} from './colors';

export type ThemeMode = 'dark' | 'light';

const THEME_STORAGE_KEY = '@dailyloop_theme_mode';

interface ThemeContextType {
  mode: ThemeMode;
  theme: ThemePalette;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'dark',
  theme: darkTheme,
  setMode: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedMode) => {
        if (savedMode === 'dark' || savedMode === 'light') {
          setModeState(savedMode as ThemeMode);
        } else if (savedMode === 'lightMinimal') {
          setModeState('light');
        } else {
          setModeState('dark');
        }
      })
      .catch(() => {});
  }, []);

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
    AsyncStorage.setItem(THEME_STORAGE_KEY, newMode).catch(() => {});
  };

  const theme = mode === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
