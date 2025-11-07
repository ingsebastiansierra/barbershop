/**
 * VideoPlayer Component
 * Plays video shorts using expo-av
 */

import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../../store/themeStore';

interface VideoPlayerProps {
  uri: string;
  autoPlay?: boolean;
  onPlayPause?: (isPlaying: boolean) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ uri, autoPlay = false, onPlayPause }) => {
  const { colors } = useThemeStore();
  const video = useRef<Video>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const togglePlayPause = async () => {
    if (!video.current) return;

    if (isPlaying) {
      await video.current.pauseAsync();
      setIsPlaying(false);
      onPlayPause?.(false);
    } else {
      await video.current.playAsync();
      setIsPlaying(true);
      onPlayPause?.(true);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setIsPlaying(status.isPlaying);
    }
  };

  // Expose togglePlayPause to parent
  React.useImperativeHandle(video, () => ({
    togglePlayPause,
  }));

  return (
    <View style={styles.container}>
      <Video
        ref={video}
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        shouldPlay={autoPlay}
        isLooping
        onPlaybackStatusUpdate={onPlaybackStatusUpdate}
      />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
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
    backgroundColor: 'rgba(0,0,0,0.3)',
    pointerEvents: 'none',
  },
});
