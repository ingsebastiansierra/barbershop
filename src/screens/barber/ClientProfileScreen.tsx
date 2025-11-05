/**
 * ClientProfileScreen (for Barber view)
 * Screen showing client profile from barber's perspective
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BarberStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';

type Props = NativeStackScreenProps<BarberStackParamList, 'ClientProfile'>;

export const ClientProfileScreen: React.FC<Props> = ({ route }) => {
  const { clientId } = route.params;
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>
        Client Profile
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        ID: {clientId}
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
