/**
 * UploadShortScreen
 * Screen for uploading new shorts (videos or images)
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { BarberStackParamList } from '../../types/navigation';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { createShort, uploadShortMedia } from '../../services/shortsService';
import { ShortMediaType } from '../../types/models';
import { supabase } from '../../supabase/client';
import * as VideoThumbnails from 'expo-video-thumbnails';
import Toast from 'react-native-toast-message';

type NavigationProp = NativeStackNavigationProp<BarberStackParamList, 'UploadShort'>;

export const UploadShortScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { colors } = useThemeStore();
  const queryClient = useQueryClient();

  const [mediaType, setMediaType] = useState<ShortMediaType | null>(null);
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [duration, setDuration] = useState<number | null>(null);

  // Get barber's barbershop_id
  const { data: barberData } = useQuery({
    queryKey: ['barber-info', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('barbers')
        .select('barbershop_id')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!mediaUri || !mediaType || !user || !barberData?.barbershop_id) {
        throw new Error('Faltan datos requeridos');
      }

      // Upload media (pass URI directly for React Native)
      const mediaUrl = await uploadShortMedia(user.id, mediaUri, mediaType);

      // Generate thumbnail for videos
      let thumbnailUrl: string | undefined;
      if (mediaType === ShortMediaType.VIDEO) {
        try {
          const { uri: thumbnailUri } = await VideoThumbnails.getThumbnailAsync(
            mediaUri,
            { time: 1000 } // Captura en el segundo 1
          );
          // Upload thumbnail
          thumbnailUrl = await uploadShortMedia(user.id, thumbnailUri, ShortMediaType.IMAGE);
        } catch (error) {
          console.error('Error generating thumbnail:', error);
          // Continue without thumbnail
        }
      }

      // Create short record
      const tagsArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      await createShort({
        barber_id: user.id,
        barbershop_id: barberData.barbershop_id,
        media_type: mediaType,
        media_url: mediaUrl,
        thumbnail_url: thumbnailUrl,
        title: title || undefined,
        description: description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        duration: duration || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['barber-shorts'] });
      Toast.show({
        type: 'success',
        text1: 'Short publicado',
        text2: 'Tu short se publicó correctamente',
      });
      navigation.goBack();
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo publicar el short',
      });
    },
  });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir imágenes');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [9, 16],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setMediaType(ShortMediaType.IMAGE);
      setMediaUri(result.assets[0].uri);
    }
  };

  const pickVideo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tu galería para subir videos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: true,
      videoMaxDuration: 60, // Max 60 seconds
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      
      // Check duration - duration is in milliseconds
      if (asset.duration && asset.duration > 60000) {
        Alert.alert('Video muy largo', 'El video debe durar máximo 60 segundos');
        return;
      }

      setMediaType(ShortMediaType.VIDEO);
      setMediaUri(asset.uri);
      setDuration(asset.duration ? Math.floor(asset.duration / 1000) : null);
    }
  };

  const handleSubmit = () => {
    if (!mediaUri || !mediaType) {
      Alert.alert('Error', 'Debes seleccionar una imagen o video');
      return;
    }

    uploadMutation.mutate();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Media selection */}
        {!mediaUri ? (
          <View>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 16 }}>
              Selecciona el tipo de contenido
            </Text>
            
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
                backgroundColor: colors.surface,
                borderRadius: 12,
                marginBottom: 12,
              }}
              onPress={pickImage}
            >
              <Ionicons name="image" size={32} color={colors.primary} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                  Subir Imagen
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                  Comparte una foto de tu trabajo
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 20,
                backgroundColor: colors.surface,
                borderRadius: 12,
              }}
              onPress={pickVideo}
            >
              <Ionicons name="videocam" size={32} color={colors.primary} />
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
                  Subir Video
                </Text>
                <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 4 }}>
                  Máximo 60 segundos
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            {/* Preview */}
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View
                style={{
                  width: 200,
                  aspectRatio: 9 / 16,
                  borderRadius: 12,
                  overflow: 'hidden',
                  backgroundColor: colors.surface,
                }}
              >
                <Image
                  source={{ uri: mediaUri }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
                {mediaType === ShortMediaType.VIDEO && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                    }}
                  >
                    <Ionicons name="play-circle" size={64} color="#fff" />
                  </View>
                )}
              </View>
              
              <TouchableOpacity
                style={{ marginTop: 12 }}
                onPress={() => {
                  setMediaUri(null);
                  setMediaType(null);
                  setDuration(null);
                }}
              >
                <Text style={{ color: colors.primary, fontSize: 14 }}>
                  Cambiar {mediaType === ShortMediaType.VIDEO ? 'video' : 'imagen'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
                Título (opcional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
                placeholder="Ej: Fade perfecto"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
            </View>

            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
                Descripción (opcional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                  minHeight: 100,
                  textAlignVertical: 'top',
                }}
                placeholder="Describe tu trabajo..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
                Etiquetas (opcional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.textPrimary,
                }}
                placeholder="Ej: fade, corte, barba (separadas por comas)"
                placeholderTextColor={colors.textSecondary}
                value={tags}
                onChangeText={setTags}
              />
            </View>

            {/* Submit button */}
            <TouchableOpacity
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                padding: 16,
                alignItems: 'center',
                opacity: uploadMutation.isPending ? 0.6 : 1,
              }}
              onPress={handleSubmit}
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  Publicar Short
                </Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};
