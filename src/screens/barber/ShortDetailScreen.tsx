/**
 * ShortDetailScreen
 * Screen to view and edit a single short
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
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BarberStackParamList } from '../../types/navigation';
import { useThemeStore } from '../../store/themeStore';
import { getShortById, updateShort } from '../../services/shortsService';
import { ShortMediaType } from '../../types/models';
import { VideoThumbnail, VideoPlayer } from '../../components/shorts';
import Toast from 'react-native-toast-message';

type RouteProps = RouteProp<BarberStackParamList, 'ShortDetail'>;
type NavigationProp = NativeStackNavigationProp<BarberStackParamList, 'ShortDetail'>;

export const ShortDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useThemeStore();
  const queryClient = useQueryClient();
  const { shortId } = route.params;

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Fetch short details
  const { data: short, isLoading } = useQuery({
    queryKey: ['short', shortId],
    queryFn: () => getShortById(shortId),
    onSuccess: (data) => {
      setTitle(data.title || '');
      setDescription(data.description || '');
      setTags(data.tags?.join(', ') || '');
      setIsActive(data.is_active);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      const tagsArray = tags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);

      await updateShort(shortId, {
        title: title || undefined,
        description: description || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        is_active: isActive,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['short', shortId] });
      queryClient.invalidateQueries({ queryKey: ['barber-shorts'] });
      setIsEditing(false);
      Toast.show({
        type: 'success',
        text1: 'Short actualizado',
        text2: 'Los cambios se guardaron correctamente',
      });
    },
    onError: (error: any) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'No se pudo actualizar el short',
      });
    },
  });

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!short) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Text style={{ color: colors.textSecondary }}>Short no encontrado</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Preview */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              width: 250,
              aspectRatio: 9 / 16,
              borderRadius: 12,
              overflow: 'hidden',
              backgroundColor: colors.surface,
            }}
          >
            {short.media_type === ShortMediaType.VIDEO ? (
              <VideoPlayer uri={short.media_url} autoPlay={false} />
            ) : (
              <Image
                source={{ uri: short.thumbnail_url || short.media_url }}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {/* Stats */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-around',
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 24,
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="eye" size={24} color={colors.primary} />
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginTop: 4 }}>
              {short.views_count}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Vistas</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Ionicons name="heart" size={24} color={colors.primary} />
            <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginTop: 4 }}>
              {short.likes_count}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Me gusta</Text>
          </View>
          {short.media_type === ShortMediaType.VIDEO && short.duration && (
            <View style={{ alignItems: 'center' }}>
              <Ionicons name="time" size={24} color={colors.primary} />
              <Text style={{ color: colors.textPrimary, fontSize: 18, fontWeight: '600', marginTop: 4 }}>
                {Math.floor(short.duration / 60)}:{(short.duration % 60).toString().padStart(2, '0')}
              </Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Duración</Text>
            </View>
          )}
        </View>

        {/* Edit form */}
        <View style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>
              Detalles
            </Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Ionicons name="create-outline" size={24} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
              Título
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: colors.textPrimary,
              }}
              placeholder="Sin título"
              placeholderTextColor={colors.textSecondary}
              value={title}
              onChangeText={setTitle}
              editable={isEditing}
              maxLength={100}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
              Descripción
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
              placeholder="Sin descripción"
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              editable={isEditing}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
              Etiquetas
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.surface,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: colors.textPrimary,
              }}
              placeholder="Sin etiquetas"
              placeholderTextColor={colors.textSecondary}
              value={tags}
              onChangeText={setTags}
              editable={isEditing}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 8,
              padding: 12,
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 16, color: colors.textPrimary }}>
              Activo
            </Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              disabled={!isEditing}
              trackColor={{ false: colors.textSecondary, true: colors.primary }}
            />
          </View>

          {isEditing && (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                }}
                onPress={() => {
                  setIsEditing(false);
                  setTitle(short.title || '');
                  setDescription(short.description || '');
                  setTags(short.tags?.join(', ') || '');
                  setIsActive(short.is_active);
                }}
              >
                <Text style={{ color: colors.textPrimary, fontSize: 16, fontWeight: '600' }}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center',
                  opacity: updateMutation.isPending ? 0.6 : 1,
                }}
                onPress={() => updateMutation.mutate()}
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                    Guardar
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};
