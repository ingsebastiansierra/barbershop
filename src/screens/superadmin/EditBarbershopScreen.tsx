/**
 * EditBarbershopScreen
 * Screen for editing a barbershop
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SuperAdminStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';

type Props = NativeStackScreenProps<SuperAdminStackParamList, 'EditBarbershop'>;

export const EditBarbershopScreen: React.FC<Props> = ({ route }) => {
  const { barbershopId } = route.params;
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>
        Edit Barbershop
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        ID: {barbershopId}
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
