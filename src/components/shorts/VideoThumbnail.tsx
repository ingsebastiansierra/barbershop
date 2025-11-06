/**
 * VideoThumbnail Component
 * Shows a placeholder for video thumbnails until expo-av is installed
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

interface VideoThumbnailProps {
  duration?: number;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({ duration }) => {
  const { colors } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Ionicons name="play-circle" size={64} color={colors.primary} />
      <Text style={[styles.text, { color: colors.textPrimary }]}>Video</Text>
      {duration && (
        <Text style={[styles.duration, { color: colors.textSecondary }]}>
          {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  duration: {
    fontSize: 14,
    marginTop: 4,
  },
});
