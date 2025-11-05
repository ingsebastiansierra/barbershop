import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useThemeStore } from './src/store/themeStore';
import Toast from 'react-native-toast-message';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function App() {
  const { theme } = useThemeStore();

  return (
    <QueryClientProvider client={queryClient}>
      <RootNavigator />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Toast />
    </QueryClientProvider>
  );
}
