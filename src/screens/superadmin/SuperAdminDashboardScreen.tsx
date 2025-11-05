/**
 * SuperAdminDashboardScreen
 * Dashboard screen for super administrators
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';

export const SuperAdminDashboardScreen: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>
        Super Admin Dashboard
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Coming soon: View global statistics and metrics
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
