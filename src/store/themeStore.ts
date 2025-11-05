/**
 * Theme Store
 * Manages theme state (light/dark) with persistence
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorScheme } from '../styles/colors';

const THEME_STORAGE_KEY = '@barbershop_theme';

export type ThemeMode = 'light' | 'dark';

interface ThemeState {
  theme: ThemeMode;
  colors: ColorScheme;
  isLoading: boolean;
  
  // Actions
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  colors: lightColors,
  isLoading: true,
  
  setTheme: async (theme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      set({
        theme,
        colors: theme === 'light' ? lightColors : darkColors,
      });
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  },
  
  toggleTheme: async () => {
    const currentTheme = get().theme;
    const newTheme: ThemeMode = currentTheme === 'light' ? 'dark' : 'light';
    await get().setTheme(newTheme);
  },
  
  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({
          theme: savedTheme,
          colors: savedTheme === 'light' ? lightColors : darkColors,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
      set({ isLoading: false });
    }
  },
}));
