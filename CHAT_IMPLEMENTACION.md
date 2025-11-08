# 💬 Sistema de Chat en Tiempo Real

Sistema completo de mensajería instantánea entre clientes y barberos con soporte para texto, imágenes y notificaciones en tiempo real.

## 🎯 Características

- ✅ Mensajería en tiempo real con Supabase Realtime
- ✅ Envío de texto e imágenes
- ✅ Contador de mensajes no leídos
- ✅ Indicadores de estado (enviado, leído)
- ✅ Historial de conversaciones
- ✅ Interfaz moderna tipo WhatsApp
- ✅ Optimizado para rendimiento
- ✅ Seguridad con RLS

## 📦 Instalación

### 1. Ejecutar Migración de Base de Datos

```bash
# En Supabase SQL Editor, ejecuta:
supabase/migrations/011_add_chat_system.sql
```

Esto creará:
- Tabla `conversations` (conversaciones)
- Tabla `messages` (mensajes)
- Bucket `chat-images` (almacenamiento de imágenes)
- Funciones y triggers automáticos
- Políticas de seguridad RLS

### 2. Verificar Permisos

Asegúrate de que el bucket `chat-images` esté configurado como público en Supabase Storage.

## 🚀 Uso

### Integrar Botón de Chat en Perfil de Barbero

```tsx
import { ChatButton } from '../components/chat';

// En BarbershopDetailScreen.tsx o BarberDetailScreen.tsx
<ChatButton
  barberId={barber.id}
  barberName={barber.full_name}
  barberAvatar={barber.avatar_url}
  variant="primary"
  size="medium"
/>
```

### Agregar Badge de No Leídos en Tab Navigator

```tsx
import { UnreadBadge } from '../components/chat';

// En tu Bottom Tab Navigator
<Tab.Screen
  name="Messages"
  component={ConversationsScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <View>
        <Ionicons name="chatbubbles" size={size} color={color} />
        <UnreadBadge />
      </View>
    ),
  }}
/>
```

### Agregar Rutas de Navegación

```tsx
// En tu Stack Navigator
import { ConversationsScreen, ChatScreen } from '../screens/common';

<Stack.Screen
  name="Conversations"
  component={ConversationsScreen}
  options={{ title: 'Mensajes' }}
/>

<Stack.Screen
  name="Chat"
  component={ChatScreen}
  options={{ headerShown: true }}
/>
```

## 📱 Pantallas

### ConversationsScreen
Lista de todas las conversaciones del usuario con:
- Avatar del otro usuario
- Último mensaje
- Tiempo transcurrido
- Contador de no leídos
- Pull to refresh

### ChatScreen
Pantalla de chat individual con:
- Mensajes en tiempo real
- Envío de texto
- Envío de imágenes
- Scroll automático
- Indicadores de tiempo
- Diseño tipo WhatsApp

## 🔧 API del Servicio

### chatService

```typescript
// Obtener o crear conversación
const conversationId = await chatService.getOrCreateConversation(
  clientId,
  barberId
);

// Obtener conversaciones del usuario
const conversations = await chatService.getConversations(userId);

// Obtener mensajes de una conversación
const messages = await chatService.getMessages(conversationId);

// Enviar mensaje de texto
await chatService.sendMessage(conversationId, senderId, 'Hola!');

// Enviar mensaje con imagen
const imageUrl = await chatService.uploadChatImage(userId, imageUri);
await chatService.sendMessage(conversationId, senderId, 'Mira esto', imageUrl);

// Marcar mensajes como leídos
await chatService.markMessagesAsRead(conversationId, userId);

// Obtener total de no leídos
const count = await chatService.getTotalUnreadCount(userId);

// Suscribirse a mensajes en tiempo real
const channel = chatService.subscribeToConversation(
  conversationId,
  (newMessage) => console.log('Nuevo mensaje:', newMessage),
  (updatedMessage) => console.log('Mensaje actualizado:', updatedMessage)
);

// Desuscribirse
chatService.unsubscribeFromConversation(conversationId);
```

## 🎨 Personalización

### Colores y Estilos

Los componentes usan Tailwind CSS (NativeWind). Puedes personalizar:

```tsx
// Cambiar color de burbujas de mensaje
className="bg-[#582308]" // Mis mensajes (marrón barbería)
className="bg-gray-200" // Mensajes recibidos

// Cambiar tamaño de avatar
className="w-14 h-14 rounded-full"

// Personalizar badge de no leídos
className="bg-red-500 rounded-full"
```

### Límites y Configuración

```typescript
// En chatService.ts

// Cambiar límite de mensajes cargados
await chatService.getMessages(conversationId, 100); // Default: 50

// Cambiar tamaño máximo de imagen
quality: 0.8, // En uploadChatImage (0.0 - 1.0)

// Límite de caracteres en mensaje
maxLength={1000} // En TextInput del ChatScreen
```

## 🔐 Seguridad

### Row Level Security (RLS)

Todas las tablas tienen políticas RLS que garantizan:
- Los usuarios solo ven sus propias conversaciones
- Solo pueden enviar mensajes en conversaciones donde participan
- No pueden modificar mensajes de otros usuarios
- Las imágenes solo pueden ser subidas por el propietario

### Validaciones

```typescript
// El servicio valida automáticamente:
- Usuario autenticado
- Pertenencia a la conversación
- Permisos de lectura/escritura
- Tamaño y tipo de archivos
```

## 📊 Base de Datos

### Estructura de Tablas

**conversations**
```sql
- id (UUID)
- client_id (UUID) → auth.users
- barber_id (UUID) → auth.users
- last_message (TEXT)
- last_message_at (TIMESTAMPTZ)
- client_unread_count (INTEGER)
- barber_unread_count (INTEGER)
- created_at, updated_at
```

**messages**
```sql
- id (UUID)
- conversation_id (UUID) → conversations
- sender_id (UUID) → auth.users
- content (TEXT)
- image_url (TEXT)
- is_read (BOOLEAN)
- created_at, updated_at
```

### Triggers Automáticos

1. **update_conversation_on_message**: Actualiza automáticamente:
   - Último mensaje
   - Timestamp
   - Contador de no leídos

2. **update_updated_at_column**: Actualiza timestamp en cada cambio

## 🚀 Optimizaciones

### Performance

- Índices en columnas frecuentemente consultadas
- Límite de mensajes cargados (paginación)
- Caché de conversaciones
- Lazy loading de imágenes
- Debounce en búsquedas

### Tiempo Real

- Suscripciones selectivas (solo conversación activa)
- Cleanup automático de canales
- Reconexión automática
- Manejo de errores de red

## 🐛 Troubleshooting

### Los mensajes no llegan en tiempo real

1. Verifica que Realtime esté habilitado en Supabase
2. Revisa las políticas RLS
3. Confirma que el canal esté suscrito correctamente

```typescript
// Debug
console.log('Channel status:', channel.state);
```

### Imágenes no se cargan

1. Verifica que el bucket `chat-images` exista
2. Confirma que sea público
3. Revisa las políticas de storage

```sql
-- En Supabase SQL Editor
SELECT * FROM storage.buckets WHERE id = 'chat-images';
```

### Contador de no leídos incorrecto

```typescript
// Forzar recarga
await chatService.markMessagesAsRead(conversationId, userId);
const count = await chatService.getTotalUnreadCount(userId);
```

## 📈 Próximas Mejoras

- [ ] Mensajes de voz
- [ ] Videollamadas
- [ ] Compartir ubicación
- [ ] Reacciones a mensajes
- [ ] Mensajes temporales
- [ ] Cifrado end-to-end
- [ ] Búsqueda en mensajes
- [ ] Exportar conversaciones
- [ ] Bloquear usuarios
- [ ] Reportar mensajes

## 🎓 Ejemplos Completos

### Ejemplo 1: Iniciar Chat desde Perfil de Barbero

```tsx
// En BarberDetailScreen.tsx
import { ChatButton } from '../../components/chat';

<View className="p-4">
  <ChatButton
    barberId={barber.id}
    barberName={barber.full_name}
    barberAvatar={barber.avatar_url}
  />
</View>
```

### Ejemplo 2: Mostrar Badge en Tab

```tsx
// En ClientNavigator.tsx
import { UnreadBadge } from '../../components/chat';

<Tab.Screen
  name="MessagesTab"
  component={ConversationsScreen}
  options={{
    title: 'Mensajes',
    tabBarIcon: ({ color }) => (
      <View className="relative">
        <Text style={{ color }}>💬</Text>
        <UnreadBadge />
      </View>
    ),
  }}
/>
```

### Ejemplo 3: Enviar Mensaje Programático

```tsx
// Enviar mensaje de bienvenida automático
const sendWelcomeMessage = async (clientId: string, barberId: string) => {
  const conversationId = await chatService.getOrCreateConversation(
    clientId,
    barberId
  );
  
  await chatService.sendMessage(
    conversationId,
    barberId,
    '¡Hola! Gracias por contactarme. ¿En qué puedo ayudarte?'
  );
};
```

## 📞 Soporte

Si tienes problemas con la implementación:
1. Revisa los logs de Supabase
2. Verifica las políticas RLS
3. Confirma que las migraciones se ejecutaron correctamente
4. Revisa la consola del navegador/app para errores

---

**¡Sistema de chat listo para usar!** 🎉
