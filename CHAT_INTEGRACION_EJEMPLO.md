# 🔧 Guía de Integración del Chat

Pasos para integrar el sistema de chat en tu app existente.

## 1️⃣ Ejecutar Migración SQL

```bash
# En Supabase Dashboard > SQL Editor
# Copia y ejecuta el contenido de:
supabase/migrations/011_add_chat_system.sql
```

## 2️⃣ Agregar Rutas al Navigator

### Para Cliente (ClientNavigator.tsx)

```tsx
import { ConversationsScreen, ChatScreen } from '../screens/common';
import { UnreadBadge } from '../components/chat';

// En el Bottom Tab Navigator
<Tab.Screen
  name="Messages"
  component={ConversationsScreen}
  options={{
    title: 'Mensajes',
    tabBarIcon: ({ color, size }) => (
      <View className="relative">
        <Ionicons name="chatbubbles-outline" size={size} color={color} />
        <UnreadBadge />
      </View>
    ),
  }}
/>

// En el Stack Navigator (fuera del Tab)
<Stack.Screen
  name="Chat"
  component={ChatScreen}
  options={{
    headerShown: true,
    title: 'Chat',
  }}
/>
```

### Para Barbero (BarberNavigator.tsx)

```tsx
import { ConversationsScreen, ChatScreen } from '../screens/common';
import { UnreadBadge } from '../components/chat';

// Igual que para cliente
<Tab.Screen
  name="Messages"
  component={ConversationsScreen}
  options={{
    title: 'Mensajes',
    tabBarIcon: ({ color, size }) => (
      <View className="relative">
        <Ionicons name="chatbubbles-outline" size={size} color={color} />
        <UnreadBadge />
      </View>
    ),
  }}
/>

<Stack.Screen
  name="Chat"
  component={ChatScreen}
/>
```

## 3️⃣ Agregar Botón de Chat en Perfiles

### En BarbershopDetailScreen.tsx

```tsx
import { ChatButton } from '../../components/chat';

// Dentro del render, después de la info del barbero
{barbers.map((barber) => (
  <View key={barber.id} className="flex-row items-center justify-between p-4">
    <View className="flex-row items-center flex-1">
      {/* Avatar y nombre del barbero */}
      <Image source={{ uri: barber.user.avatar }} className="w-12 h-12 rounded-full" />
      <Text className="ml-3 text-base font-semibold">{barber.user.full_name}</Text>
    </View>
    
    {/* Botón de chat */}
    <ChatButton
      barberId={barber.id}
      barberName={barber.user.full_name}
      barberAvatar={barber.user.avatar}
      variant="secondary"
      size="small"
    />
  </View>
))}
```

### En BarberDetailScreen.tsx

```tsx
import { ChatButton } from '../../components/chat';

// En la sección de acciones
<View className="p-4 flex-row gap-3">
  <TouchableOpacity className="flex-1 bg-[#582308] py-3 rounded-lg">
    <Text className="text-white text-center font-semibold">Reservar Cita</Text>
  </TouchableOpacity>
  
  <View className="flex-1">
    <ChatButton
      barberId={barber.id}
      barberName={barber.full_name}
      barberAvatar={barber.avatar_url}
      variant="secondary"
      size="medium"
    />
  </View>
</View>
```

### En AppointmentDetailScreen.tsx (Cliente)

```tsx
import { ChatButton } from '../../components/chat';

// Mostrar botón para contactar al barbero
{appointment.barber && (
  <View className="mt-4">
    <Text className="text-sm text-gray-600 mb-2">¿Tienes alguna pregunta?</Text>
    <ChatButton
      barberId={appointment.barber.id}
      barberName={appointment.barber.full_name}
      barberAvatar={appointment.barber.avatar_url}
      variant="primary"
      size="medium"
    />
  </View>
)}
```

### En BarberAppointmentDetailScreen.tsx (Barbero)

```tsx
import { ChatButton } from '../../components/chat';

// Mostrar botón para contactar al cliente
{appointment.client && (
  <View className="mt-4">
    <Text className="text-sm text-gray-600 mb-2">Contactar cliente</Text>
    <ChatButton
      barberId={appointment.client.id}
      barberName={appointment.client.full_name}
      barberAvatar={appointment.client.avatar_url}
      variant="primary"
      size="medium"
    />
  </View>
)}
```

## 4️⃣ Actualizar Tipos de Navegación

### types/navigation.ts

```tsx
// Agregar a ClientStackParamList
export type ClientStackParamList = {
  // ... rutas existentes
  Conversations: undefined;
  Chat: {
    conversationId: string;
    otherUser: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  };
};

// Agregar a BarberStackParamList
export type BarberStackParamList = {
  // ... rutas existentes
  Conversations: undefined;
  Chat: {
    conversationId: string;
    otherUser: {
      id: string;
      full_name: string;
      avatar_url?: string;
    };
  };
};
```

## 5️⃣ Agregar Notificaciones Push (Opcional)

### En el servicio de notificaciones

```tsx
// services/notificationService.ts

export const sendChatNotification = async (
  userId: string,
  senderName: string,
  message: string
) => {
  // Obtener token del usuario
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('push_token')
    .eq('user_id', userId)
    .single();

  if (!profile?.push_token) return;

  // Enviar notificación
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: profile.push_token,
      title: senderName,
      body: message,
      data: { type: 'chat', userId },
      sound: 'default',
      badge: 1,
    }),
  });
};
```

### Trigger en Supabase para enviar notificación

```sql
-- Agregar al final de 011_add_chat_system.sql

CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_receiver_id UUID;
  v_sender_name TEXT;
BEGIN
  -- Determinar receptor
  SELECT CASE 
    WHEN NEW.sender_id = c.client_id THEN c.barber_id
    ELSE c.client_id
  END INTO v_receiver_id
  FROM conversations c
  WHERE c.id = NEW.conversation_id;

  -- Obtener nombre del emisor
  SELECT full_name INTO v_sender_name
  FROM auth.users
  WHERE id = NEW.sender_id;

  -- Aquí puedes integrar con tu sistema de notificaciones
  -- Por ejemplo, insertar en una tabla de notificaciones pendientes
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();
```

## 6️⃣ Testing

### Probar el flujo completo:

1. **Como Cliente:**
   - Ve al perfil de un barbero
   - Presiona el botón "Mensaje"
   - Envía un mensaje de texto
   - Envía una imagen
   - Verifica que aparezca en la lista de conversaciones

2. **Como Barbero:**
   - Abre la app en otro dispositivo/cuenta
   - Ve a la pestaña "Mensajes"
   - Verifica que aparezca la conversación
   - Verifica el badge de no leídos
   - Responde al mensaje
   - Verifica que se actualice en tiempo real

3. **Verificar Tiempo Real:**
   - Abre la misma conversación en dos dispositivos
   - Envía un mensaje desde uno
   - Verifica que aparezca instantáneamente en el otro

## 7️⃣ Personalización Avanzada

### Cambiar colores del chat

```tsx
// En ChatScreen.tsx, busca y modifica:

// Burbujas de mensaje
className={`${isMyMessage ? 'bg-purple-500' : 'bg-gray-200'}`}

// Botón de enviar
className="bg-purple-500"
```

### Agregar sonido de notificación

```tsx
import { Audio } from 'expo-av';

// En ChatScreen.tsx
const playNotificationSound = async () => {
  const { sound } = await Audio.Sound.createAsync(
    require('../../assets/sounds/notification.mp3')
  );
  await sound.playAsync();
};

// Llamar cuando llegue un mensaje nuevo
const handleNewMessage = (message: Message) => {
  if (message.sender_id !== user?.id) {
    playNotificationSound();
  }
  // ... resto del código
};
```

### Agregar indicador de "escribiendo..."

```tsx
// En chatService.ts
async setTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
  await supabase
    .from('typing_status')
    .upsert({
      conversation_id: conversationId,
      user_id: userId,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    });
}

// En ChatScreen.tsx
const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);

// Suscribirse a cambios de typing
useEffect(() => {
  const channel = supabase
    .channel(`typing:${conversationId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'typing_status',
      filter: `conversation_id=eq.${conversationId}`,
    }, (payload) => {
      if (payload.new.user_id !== user?.id) {
        setIsOtherUserTyping(payload.new.is_typing);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [conversationId]);

// Mostrar indicador
{isOtherUserTyping && (
  <View className="px-4 py-2">
    <Text className="text-gray-500 text-sm italic">
      {otherUser.full_name} está escribiendo...
    </Text>
  </View>
)}
```

## 🎉 ¡Listo!

Tu sistema de chat está completamente integrado. Los usuarios ahora pueden:
- ✅ Enviar mensajes de texto
- ✅ Compartir imágenes
- ✅ Ver conversaciones en tiempo real
- ✅ Recibir notificaciones de mensajes nuevos
- ✅ Ver contador de no leídos

## 📚 Recursos Adicionales

- [Documentación completa](CHAT_IMPLEMENTACION.md)
- [API del servicio](src/services/chatService.ts)
- [Componentes](src/components/chat/)
- [Pantallas](src/screens/common/)
