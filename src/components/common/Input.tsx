/**
 * Input Component
 * Reusable text input with validation and error states
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  KeyboardTypeOptions,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { typography, spacing, borderRadius } from '../../styles/theme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  leftIcon,
  rightIcon,
  multiline = false,
  numberOfLines = 1,
  editable = true,
}) => {
  const { colors } = useThemeStore();
  const [isFocused, setIsFocused] = useState(false);

  const containerStyle: ViewStyle = {
    marginBottom: spacing.md,
  };

  const labelStyle: TextStyle = {
    ...typography.labelMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  };

  const inputContainerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: multiline ? 'flex-start' : 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: error ? colors.error : isFocused ? colors.primary : colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  };

  const inputStyle: TextStyle = {
    ...typography.bodyMedium,
    flex: 1,
    color: colors.textPrimary,
    paddingVertical: 0,
    ...(multiline && { minHeight: numberOfLines * 20 }),
  };

  const errorStyle: TextStyle = {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: spacing.xs,
  };

  const iconContainerStyle: ViewStyle = {
    marginRight: spacing.sm,
    ...(multiline && { paddingTop: spacing.xs }),
  };

  return (
    <View style={containerStyle}>
      <Text style={labelStyle}>{label}</Text>
      <View style={inputContainerStyle}>
        {leftIcon && <View style={iconContainerStyle}>{leftIcon}</View>}
        <TextInput
          style={inputStyle}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
        />
        {rightIcon && <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View>}
      </View>
      {error && <Text style={errorStyle}>{error}</Text>}
    </View>
  );
};
