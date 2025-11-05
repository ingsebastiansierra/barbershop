/**
 * EditServiceScreen
 * Screen for editing a service
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';

type Props = NativeStackScreenProps<AdminStackParamList, 'EditService'>;

export const EditServiceScreen: React.FC<Props> = ({ route }) => {
  const { serviceId } = route.params;
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.textPrimary }]}>
        Edit Service
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        ID: {serviceId}
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
