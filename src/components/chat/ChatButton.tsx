import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../store/authStore';

interface ChatButtonProps {
  barberId: string;
  barberName: string;
  barberAvatar?: string;
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}

export const ChatButton: React.FC<ChatButtonProps> = ({
  barberId,
  barberName,
  barberAvatar,
  variant = 'primary',
  size = 'medium',
}) => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión para enviar mensajes');
      return;
    }

    if (user.id === barberId) {
      Alert.alert('Error', 'No puedes enviarte mensajes a ti mismo');
      return;
    }

    setLoading(true);
    try {
      const conversationId = await chatService.getOrCreateConversation(
        user.id,
        barberId
      );

      navigation.navigate('Chat' as never, {
        conversationId,
        otherUser: {
          id: barberId,
          full_name: barberName,
          avatar_url: barberAvatar,
        },
      } as never);
    } catch (error) {
      console.error('Error creating conversation:', error);
      Alert.alert('Error', 'No se pudo iniciar la conversación');
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    small: 'px-3 py-1.5',
    medium: 'px-4 py-2',
    large: 'px-6 py-3',
  };

  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
  };

  const variantClasses = {
    primary: 'bg-[#582308]',
    secondary: 'bg-gray-200 dark:bg-gray-700',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-gray-900 dark:text-white',
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading}
      className={`${variantClasses[variant]} ${sizeClasses[size]} rounded-full flex-row items-center justify-center`}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? 'white' : '#582308'} />
      ) : (
        <>
          <Text className="text-xl mr-2">💬</Text>
          <Text className={`${textVariantClasses[variant]} ${textSizeClasses[size]} font-semibold`}>
            Mensaje
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};
