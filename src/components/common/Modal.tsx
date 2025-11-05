/**
 * Modal Component
 * Reusable modal with customizable actions
 */

import React from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { typography, spacing, borderRadius, shadows } from '../../styles/theme';
import { Button } from './Button';

interface ModalAction {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: ModalAction[];
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  visible,
  onClose,
  title,
  children,
  actions,
  showCloseButton = true,
}) => {
  const { colors } = useThemeStore();

  const overlayStyle: ViewStyle = {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  };

  const containerStyle: ViewStyle = {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    width: '100%',
    maxWidth: 400,
    maxHeight: Dimensions.get('window').height * 0.8,
    ...shadows.lg,
  };

  const headerStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  };

  const titleStyle: TextStyle = {
    ...typography.h4,
    color: colors.textPrimary,
    flex: 1,
  };

  const closeButtonStyle: ViewStyle = {
    padding: spacing.xs,
    marginLeft: spacing.md,
  };

  const closeTextStyle: TextStyle = {
    ...typography.h3,
    color: colors.textSecondary,
  };

  const contentStyle: ViewStyle = {
    padding: spacing.lg,
  };

  const actionsStyle: ViewStyle = {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={overlayStyle}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={containerStyle}>
            {/* Header */}
            <View style={headerStyle}>
              <Text style={titleStyle}>{title}</Text>
              {showCloseButton && (
                <TouchableOpacity
                  style={closeButtonStyle}
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={closeTextStyle}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            <View style={contentStyle}>{children}</View>

            {/* Actions */}
            {actions && actions.length > 0 && (
              <View style={actionsStyle}>
                {actions.map((action, index) => (
                  <Button
                    key={index}
                    title={action.label}
                    onPress={action.onPress}
                    variant={action.variant || 'primary'}
                    size="md"
                  />
                ))}
              </View>
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};
