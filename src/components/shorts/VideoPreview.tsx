/**
 * VideoPreview Component
 * Shows the first frame of a video as a static preview
 */

import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

interface VideoPreviewProps {
  uri: string;
  thumbnailUri?: string;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({ uri, thumbnailUri }) => {
  const { colors } = useThemeStore();
  const [isLoading, setIsLoading] = useState(!thumbnailUri);
  const [hasError, setHasError] = useState(false);

  // Si hay thumbnail, usarlo directamente
  if (thumbnailUri) {
    return (
      <View style={styles.container}>
        <Image
          source={{ uri: thumbnailUri }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
        {hasError && (
          <View style={[styles.placeholder, { backgroundColor: colors.surface }]}>
            <Ionicons name="videocam-outline" size={48} color={colors.textSecondary} />
          </View>
        )}
      </View>
    );
  }

  // Si no hay thumbnail, mostrar el primer frame del video
  return (
    <View style={styles.container}>
      <Video
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={false}
        positionMillis={0}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
      
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      {hasError && (
        <View style={[styles.placeholder, { backgroundColor: colors.surface }]}>
          <Ionicons name="videocam-outline" size={48} color={colors.textSecondary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
