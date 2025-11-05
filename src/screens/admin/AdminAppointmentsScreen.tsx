/**
 * AdminAppointmentsScreen
 * Screen for managing all barbershop appointments
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useThemeStore } from '../../store/themeStore';

export const AdminAppointmentsScreen: React.FC = () => {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>
        Appointments
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Coming soon: Manage all barbershop appointments
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
