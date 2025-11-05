/**
 * Theme Provider
 * Wraps the app and provides theme context
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../../store/themeStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, loadTheme, isLoading } = useThemeStore();

  useEffect(() => {
    loadTheme();
  }, []);

  if (isLoading) {
    // Return null or a loading screen while theme is being loaded
    return null;
  }

  return (
    <>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      {children}
    </>
  );
};
