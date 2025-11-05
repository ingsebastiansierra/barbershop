/**
 * Avatar Component
 * Displays user avatar with image or fallback initials
 */

import React from 'react';
import { View, Text, Image, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useThemeStore } from '../../store/themeStore';
import { typography, borderRadius } from '../../styles/theme';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  uri?: string;
  name: string;
  size?: AvatarSize;
  onPress?: () => void;
  editable?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  name,
  size = 'md',
  onPress,
  editable = false,
}) => {
  const { colors } = useThemeStore();

  const sizeMap: Record<AvatarSize, number> = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  };

  const fontSizeMap: Record<AvatarSize, number> = {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 36,
  };

  const avatarSize = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const getInitials = (fullName: string): string => {
    const names = fullName.trim().split(' ');
    if (names.length === 0) return '?';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const containerStyle: ViewStyle = {
    width: avatarSize,
    height: avatarSize,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  const textStyle: TextStyle = {
    color: '#FFFFFF',
    fontSize,
    fontWeight: '600',
  };

  const imageStyle = {
    width: avatarSize,
    height: avatarSize,
  };

  const editBadgeStyle: ViewStyle = {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: avatarSize * 0.3,
    height: avatarSize * 0.3,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  };

  const content = (
    <View style={containerStyle}>
      {uri ? (
        <Image source={{ uri }} style={imageStyle} resizeMode="cover" />
      ) : (
        <Text style={textStyle}>{getInitials(name)}</Text>
      )}
      {editable && (
        <View style={editBadgeStyle}>
          <Text style={{ color: '#FFFFFF', fontSize: avatarSize * 0.15 }}>✎</Text>
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};
