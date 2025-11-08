# 🏗️ Arquitectura del Sistema de Chat

Documentación técnica de la arquitectura del sistema de mensajería en tiempo real.

## 📐 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                        REACT NATIVE APP                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Conversations│  │  ChatScreen  │  │  ChatButton  │      │
│  │   Screen     │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         └──────────────────┼──────────────────┘              │
│                            │                                 │
│                    ┌───────▼────────┐                        │
│                    │  chatService   │                        │
│                    │  (Singleton)   │                        │
│                    └───────┬────────┘                        │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Supabase SDK   │
                    └────────┬────────┘
                             │
        ┏━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━┓
        ┃                                           ┃
   ┌────▼─────┐                              ┌─────▼─────┐
   │ REST API │                              │ Realtime  │
   │          │                              │ WebSocket │
   └────┬─────┘                              └─────┬─────┘
        │                                          │
┌───────▼──────────────────────────────────────────▼───────┐
│                    SUPABASE BACKEND                       │
├───────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ conversations│  │   messages   │  │ chat-images  │   │
│  │   (Table)    │  │   (Table)    │  │  (Storage)   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────────┘   │
│         │                  │                              │
│  ┌──────▼──────────────────▼───────┐                     │
│  │      PostgreSQL Database        │                     │
│  │  + Row Level Security (RLS)     │                     │
│  │  + Triggers & Functions         │                     │
│  └─────────────────────────────────┘                     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

## 🗂️ Estructura de Datos

### Tabla: conversations

```typescript
interface Conversation {
  id: UUID;                      // PK
  client_id: UUID;               // FK → auth.users
  barber_id: UUID;               // FK → auth.users
  last_message: string | null;
  last_message_at: timestamp | null;
  client_unread_count: number;  // Default: 0
  barber_unread_count: number;  // Default: 0
  created_at: timestamp;
  updated_at: timestamp;
  
  // Unique constraint: (client_id, barber_id)
}
```

### Tabla: messages

```typescript
interface Message {
  id: UUID;                      // PK
  conversation_id: UUID;         // FK → conversations
  sender_id: UUID;               // FK → auth.users
  content: string;               // NOT NULL
  image_url: string | null;
  is_read: boolean;              // Default: false
  created_at: timestamp;
  updated_at: timestamp;
}
```

### Índices

```sql
-- Optimización de queries
idx_conversations_client     ON conversations(client_id)
idx_conversations_barber     ON conversations(barber_id)
idx_conversations_updated    ON conversations(updated_at DESC)
idx_messages_conversation    ON messages(conversation_id, created_at DESC)
idx_messages_sender          ON messages(sender_id)
idx_messages_unread          ON messages(conversation_id, is_read) WHERE is_read = FALSE
```

## 🔄 Flujo de Datos

### 1. Crear/Obtener Conversación

```
Cliente                    App                    Supabase
  │                         │                         │
  │  Presiona "Mensaje"     │                         │
  ├────────────────────────>│                         │
  │                         │  get_or_create_conv()   │
  │                         ├────────────────────────>│
  │                         │                         │
  │                         │  SELECT/INSERT          │
  │                         │<────────────────────────┤
  │                         │  conversation_id        │
  │  Navega a ChatScreen    │                         │
  │<────────────────────────┤                         │
  │                         │                         │
```

### 2. Enviar Mensaje

```
Usuario                    App                    Supabase
  │                         │                         │
  │  Escribe mensaje        │                         │
  │  Presiona enviar        │                         │
  ├────────────────────────>│                         │
  │                         │  INSERT message         │
  │                         ├────────────────────────>│
  │                         │                         │
  │                         │  ┌──────────────────┐  │
  │                         │  │ TRIGGER:         │  │
  │                         │  │ - Update conv    │  │
  │                         │  │ - Increment unread│ │
  │                         │  │ - Set last_msg   │  │
  │                         │  └──────────────────┘  │
  │                         │                         │
  │                         │  Broadcast via WS       │
  │                         │<════════════════════════┤
  │  Mensaje aparece        │                         │
  │<────────────────────────┤                         │
  │                         │                         │
```

### 3. Recibir Mensaje (Tiempo Real)

```
Usuario A                  App A                  Supabase                  App B                  Usuario B
  │                         │                         │                         │                         │
  │  Envía mensaje          │                         │                         │                         │
  ├────────────────────────>│  INSERT                 │                         │                         │
  │                         ├────────────────────────>│                         │                         │
  │                         │                         │  WebSocket Broadcast    │                         │
  │                         │                         ├────────────────────────>│                         │
  │                         │                         │                         │  onNewMessage()         │
  │                         │                         │                         │  Actualiza UI           │
  │                         │                         │                         ├────────────────────────>│
  │                         │                         │                         │  Mensaje aparece        │
  │                         │                         │                         │                         │
```

## 🔐 Seguridad (RLS)

### Políticas de conversations

```sql
-- SELECT: Ver solo mis conversaciones
CREATE POLICY "view_own_conversations"
  ON conversations FOR SELECT
  USING (auth.uid() = client_id OR auth.uid() = barber_id);

-- INSERT: Crear solo si soy participante
CREATE POLICY "create_conversations"
  ON conversations FOR INSERT
  WITH CHECK (auth.uid() = client_id OR auth.uid() = barber_id);

-- UPDATE: Actualizar solo mis conversaciones
CREATE POLICY "update_own_conversations"
  ON conversations FOR UPDATE
  USING (auth.uid() = client_id OR auth.uid() = barber_id);
```

### Políticas de messages

```sql
-- SELECT: Ver mensajes de mis conversaciones
CREATE POLICY "view_conversation_messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = messages.conversation_id
      AND (client_id = auth.uid() OR barber_id = auth.uid())
    )
  );

-- INSERT: Enviar solo en mis conversaciones
CREATE POLICY "send_messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE id = conversation_id
      AND (client_id = auth.uid() OR barber_id = auth.uid())
    )
  );
```

## ⚡ Optimizaciones

### 1. Caché de Conversaciones

```typescript
// En chatService.ts
private conversationsCache: Map<string, Conversation[]> = new Map();

async getConversations(userId: string): Promise<Conversation[]> {
  // Verificar caché
  if (this.conversationsCache.has(userId)) {
    return this.conversationsCache.get(userId)!;
  }
  
  // Fetch y guardar en caché
  const data = await supabase.from('conversations')...;
  this.conversationsCache.set(userId, data);
  return data;
}
```

### 2. Paginación de Mensajes

```typescript
async getMessages(
  conversationId: string,
  limit = 50,
  offset = 0
): Promise<Message[]> {
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  return (data || []).reverse();
}
```

### 3. Debounce en Búsqueda

```typescript
// En ConversationsScreen.tsx
const [searchQuery, setSearchQuery] = useState('');
const debouncedSearch = useDebounce(searchQuery, 300);

useEffect(() => {
  if (debouncedSearch) {
    searchConversations(debouncedSearch);
  }
}, [debouncedSearch]);
```

### 4. Lazy Loading de Imágenes

```typescript
// En ChatScreen.tsx
<Image
  source={{ uri: message.image_url }}
  style={styles.image}
  resizeMode="cover"
  loadingIndicatorSource={require('../../assets/loading.gif')}
/>
```

## 📊 Métricas y Monitoreo

### Queries Importantes

```sql
-- Conversaciones más activas
SELECT 
  c.id,
  COUNT(m.id) as message_count,
  MAX(m.created_at) as last_activity
FROM conversations c
LEFT JOIN messages m ON m.conversation_id = c.id
GROUP BY c.id
ORDER BY message_count DESC
LIMIT 10;

-- Usuarios más activos
SELECT 
  u.full_name,
  COUNT(m.id) as messages_sent
FROM auth.users u
LEFT JOIN messages m ON m.sender_id = u.id
GROUP BY u.id, u.full_name
ORDER BY messages_sent DESC
LIMIT 10;

-- Mensajes por hora del día
SELECT 
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as message_count
FROM messages
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY hour
ORDER BY hour;

-- Tasa de respuesta promedio
WITH response_times AS (
  SELECT 
    m1.conversation_id,
    m2.created_at - m1.created_at as response_time
  FROM messages m1
  JOIN messages m2 ON m2.conversation_id = m1.conversation_id
  WHERE m1.sender_id != m2.sender_id
  AND m2.created_at > m1.created_at
)
SELECT 
  AVG(response_time) as avg_response_time,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY response_time) as median_response_time
FROM response_times;
```

## 🔄 Ciclo de Vida de Componentes

### ConversationsScreen

```
┌─────────────────────────────────────┐
│         ComponentDidMount           │
│  1. Load conversations              │
│  2. Subscribe to updates            │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         Active State                │
│  - Display conversations            │
│  - Listen for realtime updates      │
│  - Handle refresh                   │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│       ComponentWillUnmount          │
│  1. Unsubscribe from channels       │
│  2. Clear cache                     │
└─────────────────────────────────────┘
```

### ChatScreen

```
┌─────────────────────────────────────┐
│         ComponentDidMount           │
│  1. Load messages                   │
│  2. Subscribe to new messages       │
│  3. Mark as read                    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│         Active State                │
│  - Display messages                 │
│  - Listen for new messages          │
│  - Handle send                      │
│  - Auto-scroll                      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│       ComponentWillUnmount          │
│  1. Unsubscribe from channel        │
│  2. Mark messages as read           │
└─────────────────────────────────────┘
```

## 🎯 Patrones de Diseño Utilizados

### 1. Singleton Pattern
```typescript
// chatService es una instancia única
export const chatService = new ChatService();
```

### 2. Observer Pattern
```typescript
// Realtime subscriptions
subscribeToConversation(conversationId, onNewMessage, onUpdate)
```

### 3. Repository Pattern
```typescript
// chatService abstrae la lógica de datos
class ChatService {
  async getMessages() { /* ... */ }
  async sendMessage() { /* ... */ }
}
```

### 4. Factory Pattern
```typescript
// Creación de conversaciones
async getOrCreateConversation(clientId, barberId) {
  // Busca existente o crea nueva
}
```

## 🚀 Escalabilidad

### Límites Actuales
- Mensajes por conversación: Ilimitado (con paginación)
- Conversaciones por usuario: Ilimitado
- Tamaño de imagen: 5MB (configurable)
- Conexiones simultáneas: Según plan de Supabase

### Mejoras Futuras
1. **Sharding de mensajes** por fecha
2. **CDN** para imágenes
3. **Compresión** de imágenes automática
4. **Archivado** de conversaciones antiguas
5. **Caché distribuido** (Redis)

---

**Arquitectura diseñada para escalar** 📈
