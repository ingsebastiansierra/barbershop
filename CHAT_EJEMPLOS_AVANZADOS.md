# 🎓 Ejemplos Avanzados del Sistema de Chat

Casos de uso avanzados y personalizaciones del sistema de chat.

## 1. 🔔 Notificaciones Push al Recibir Mensaje

### Configurar Expo Notifications

```typescript
// services/pushNotificationService.ts
import * as Notifications from 'expo-notifications';
import { supabase } from '../supabase/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const registerForPushNotifications = async (userId: string) => {
  const { status } = await Notifications.requestPermissionsAsync();
  
  if (status !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Guardar token en la base de datos
  await supabase
    .from('user_profiles')
    .update({ push_token: token })
    .eq('user_id', userId);

  return token;
};

export const sendChatPushNotification = async (
  recipientToken: string,
  senderName: string,
  message: string,
  conversationId: string
) => {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: recipientToken,
      title: senderName,
      body: message,
      data: {
        type: 'chat',
        conversationId,
      },
      sound: 'default',
      badge: 1,
      priority: 'high',
    }),
  });
};
```

### Trigger en Supabase

```sql
-- Agregar columna para push tokens
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS push_token TEXT;

-- Función para enviar notificación
CREATE OR REPLACE FUNCTION send_message_notification()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_recipient_token TEXT;
  v_sender_name TEXT;
BEGIN
  -- Determinar receptor
  SELECT CASE 
    WHEN NEW.sender_id = c.client_id THEN c.barber_id
    ELSE c.client_id
  END INTO v_recipient_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- Obtener token del receptor
  SELECT push_token INTO v_recipient_token
  FROM user_profiles
  WHERE user_id = v_recipient_id;

  -- Obtener nombre del emisor
  SELECT full_name INTO v_sender_name
  FROM auth.users
  WHERE id = NEW.sender_id;

  -- Insertar en tabla de notificaciones pendientes
  IF v_recipient_token IS NOT NULL THEN
    INSERT INTO pending_notifications (
      user_id,
      push_token,
      title,
      body,
      data
    ) VALUES (
      v_recipient_id,
      v_recipient_token,
      v_sender_name,
      NEW.content,
      jsonb_build_object(
        'type', 'chat',
        'conversationId', NEW.conversation_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_send_message_notification
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION send_message_notification();
```

## 2. ✍️ Indicador de "Escribiendo..."

### Crear tabla de typing status

```sql
CREATE TABLE IF NOT EXISTS typing_status (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Índice para queries rápidas
CREATE INDEX idx_typing_status_conversation ON typing_status(conversation_id);

-- Auto-limpiar después de 5 segundos
CREATE OR REPLACE FUNCTION cleanup_typing_status()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM typing_status
  WHERE updated_at < NOW() - INTERVAL '5 seconds';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_typing
  AFTER INSERT OR UPDATE ON typing_status
  FOR EACH STATEMENT
  EXECUTE FUNCTION cleanup_typing_status();
```

### Implementar en el servicio

```typescript
// En chatService.ts
async setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  await supabase
    .from('typing_status')
    .upsert({
      conversation_id: conversationId,
      user_id: userId,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    });
}

subscribeToTypingStatus(
  conversationId: string,
  onTypingChange: (userId: string, isTyping: boolean) => void
): RealtimeChannel {
  const channelName = `typing:${conversationId}`;
  
  const channel = supabase
    .channel(channelName)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_status',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onTypingChange(payload.new.user_id, payload.new.is_typing);
      }
    )
    .subscribe();

  this.channels.set(channelName, channel);
  return channel;
}
```

### Usar en ChatScreen

```typescript
// En ChatScreen.tsx
const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
const typingTimeoutRef = useRef<NodeJS.Timeout>();

useEffect(() => {
  if (user && conversationId) {
    const channel = chatService.subscribeToTypingStatus(
      conversationId,
      (userId, isTyping) => {
        if (userId !== user.id) {
          setIsOtherUserTyping(isTyping);
        }
      }
    );

    return () => {
      supabase.removeChannel(channel);
    };
  }
}, [user, conversationId]);

const handleTextChange = (text: string) => {
  setInputText(text);

  // Limpiar timeout anterior
  if (typingTimeoutRef.current) {
    clearTimeout(typingTimeoutRef.current);
  }

  // Indicar que está escribiendo
  if (text.length > 0 && user) {
    chatService.setTypingStatus(conversationId, user.id, true);

    // Auto-limpiar después de 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      chatService.setTypingStatus(conversationId, user.id, false);
    }, 3000);
  } else if (user) {
    chatService.setTypingStatus(conversationId, user.id, false);
  }
};

// En el render
{isOtherUserTyping && (
  <View className="px-4 py-2 flex-row items-center">
    <View className="flex-row space-x-1">
      <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
      <View className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
    </View>
    <Text className="ml-2 text-gray-500 text-sm italic">
      {otherUser.full_name} está escribiendo...
    </Text>
  </View>
)}
```

## 3. 📎 Enviar Múltiples Tipos de Archivos

### Extender el servicio

```typescript
// En chatService.ts
async uploadChatFile(
  userId: string,
  fileUri: string,
  fileType: 'image' | 'video' | 'audio' | 'document'
): Promise<string> {
  const response = await fetch(fileUri);
  const blob = await response.blob();
  const fileExt = fileUri.split('.').pop() || 'bin';
  const fileName = `${userId}/${fileType}s/${Date.now()}.${fileExt}`;

  const bucketName = `chat-${fileType}s`;

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, blob, {
      contentType: blob.type,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

async sendFileMessage(
  conversationId: string,
  senderId: string,
  fileUrl: string,
  fileType: 'image' | 'video' | 'audio' | 'document',
  fileName?: string
): Promise<Message> {
  const content = fileName || `📎 ${fileType}`;
  
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      file_url: fileUrl,
      file_type: fileType,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

### Migración para archivos

```sql
-- Agregar columnas para archivos
ALTER TABLE messages 
  ADD COLUMN IF NOT EXISTS file_url TEXT,
  ADD COLUMN IF NOT EXISTS file_type TEXT CHECK (file_type IN ('image', 'video', 'audio', 'document'));

-- Crear buckets adicionales
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('chat-videos', 'chat-videos', true),
  ('chat-audios', 'chat-audios', true),
  ('chat-documents', 'chat-documents', true)
ON CONFLICT (id) DO NOTHING;
```

## 4. 🔍 Búsqueda en Mensajes

### Agregar índice de búsqueda

```sql
-- Crear índice de texto completo
CREATE INDEX idx_messages_content_search 
ON messages 
USING gin(to_tsvector('spanish', content));

-- Función de búsqueda
CREATE OR REPLACE FUNCTION search_messages(
  p_user_id UUID,
  p_search_query TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  sender_name TEXT,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.conversation_id,
    m.content,
    m.created_at,
    u.full_name,
    ts_rank(to_tsvector('spanish', m.content), plainto_tsquery('spanish', p_search_query)) as rank
  FROM messages m
  JOIN conversations c ON c.id = m.conversation_id
  JOIN auth.users u ON u.id = m.sender_id
  WHERE (c.client_id = p_user_id OR c.barber_id = p_user_id)
    AND to_tsvector('spanish', m.content) @@ plainto_tsquery('spanish', p_search_query)
  ORDER BY rank DESC, m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Implementar búsqueda

```typescript
// En chatService.ts
async searchMessages(
  userId: string,
  query: string,
  limit = 50
): Promise<any[]> {
  const { data, error } = await supabase.rpc('search_messages', {
    p_user_id: userId,
    p_search_query: query,
    p_limit: limit,
  });

  if (error) throw error;
  return data || [];
}
```

### UI de búsqueda

```typescript
// SearchMessagesScreen.tsx
import React, { useState } from 'react';
import { View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';
import { chatService } from '../../services/chatService';
import { useAuthStore } from '../../store/authStore';

export const SearchMessagesScreen = () => {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!user || !query.trim()) return;

    setLoading(true);
    try {
      const data = await chatService.searchMessages(user.id, query);
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white dark:bg-gray-900">
      <View className="p-4">
        <TextInput
          className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3"
          placeholder="Buscar en mensajes..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.message_id}
        renderItem={({ item }) => (
          <TouchableOpacity className="p-4 border-b border-gray-200">
            <Text className="font-semibold">{item.sender_name}</Text>
            <Text className="text-gray-600">{item.content}</Text>
            <Text className="text-xs text-gray-400 mt-1">
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};
```

## 5. 🎤 Mensajes de Voz

### Grabar y enviar audio

```typescript
// components/chat/VoiceRecorder.tsx
import React, { useState } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { Audio } from 'expo-av';
import { chatService } from '../../services/chatService';

interface VoiceRecorderProps {
  conversationId: string;
  userId: string;
  onSent: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  conversationId,
  userId,
  onSent,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();

    if (uri) {
      // Subir audio
      const audioUrl = await chatService.uploadChatFile(userId, uri, 'audio');
      
      // Enviar mensaje
      await chatService.sendFileMessage(
        conversationId,
        userId,
        audioUrl,
        'audio',
        '🎤 Mensaje de voz'
      );

      onSent();
    }

    setRecording(null);
  };

  return (
    <TouchableOpacity
      onPressIn={startRecording}
      onPressOut={stopRecording}
      className={`p-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-[#582308]'}`}
    >
      <Text className="text-white text-xl">
        {isRecording ? '⏹️' : '🎤'}
      </Text>
    </TouchableOpacity>
  );
};
```

## 6. 📊 Analytics del Chat

### Queries útiles

```sql
-- Estadísticas de uso
CREATE OR REPLACE FUNCTION get_chat_analytics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'total_conversations', (
      SELECT COUNT(*) FROM conversations
      WHERE client_id = p_user_id OR barber_id = p_user_id
    ),
    'total_messages_sent', (
      SELECT COUNT(*) FROM messages
      WHERE sender_id = p_user_id
    ),
    'total_messages_received', (
      SELECT COUNT(*) FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE m.sender_id != p_user_id
      AND (c.client_id = p_user_id OR c.barber_id = p_user_id)
    ),
    'avg_response_time_minutes', (
      WITH response_times AS (
        SELECT 
          EXTRACT(EPOCH FROM (m2.created_at - m1.created_at)) / 60 as minutes
        FROM messages m1
        JOIN messages m2 ON m2.conversation_id = m1.conversation_id
        JOIN conversations c ON c.id = m1.conversation_id
        WHERE m1.sender_id != m2.sender_id
        AND m2.created_at > m1.created_at
        AND (c.client_id = p_user_id OR c.barber_id = p_user_id)
        AND m2.sender_id = p_user_id
      )
      SELECT ROUND(AVG(minutes)::numeric, 2) FROM response_times
    ),
    'most_active_conversation', (
      SELECT json_build_object(
        'conversation_id', m.conversation_id,
        'message_count', COUNT(*)
      )
      FROM messages m
      JOIN conversations c ON c.id = m.conversation_id
      WHERE c.client_id = p_user_id OR c.barber_id = p_user_id
      GROUP BY m.conversation_id
      ORDER BY COUNT(*) DESC
      LIMIT 1
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 7. 🚫 Bloquear Usuarios

### Tabla de usuarios bloqueados

```sql
CREATE TABLE IF NOT EXISTS blocked_users (
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Modificar políticas para excluir bloqueados
CREATE OR REPLACE FUNCTION can_message(p_sender_id UUID, p_receiver_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1 FROM blocked_users
    WHERE (blocker_id = p_receiver_id AND blocked_id = p_sender_id)
    OR (blocker_id = p_sender_id AND blocked_id = p_receiver_id)
  );
END;
$$ LANGUAGE plpgsql;

-- Actualizar política de mensajes
DROP POLICY IF EXISTS "send_messages" ON messages;
CREATE POLICY "send_messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = conversation_id
      AND (c.client_id = auth.uid() OR c.barber_id = auth.uid())
      AND can_message(c.client_id, c.barber_id)
    )
  );
```

---

**¡Implementaciones avanzadas listas para usar!** 🚀
