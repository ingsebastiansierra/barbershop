# 💬 Sistema de Chat en Tiempo Real - Trimly

Sistema completo de mensajería instantánea para la app de barberías Trimly.

## 📋 Índice de Documentación

1. **[CHAT_IMPLEMENTACION.md](CHAT_IMPLEMENTACION.md)** - Guía completa de implementación
2. **[CHAT_INTEGRACION_EJEMPLO.md](CHAT_INTEGRACION_EJEMPLO.md)** - Ejemplos de integración
3. **[CHAT_QUICK_TEST.md](CHAT_QUICK_TEST.md)** - Pruebas rápidas del sistema
4. **[CHAT_ARQUITECTURA.md](CHAT_ARQUITECTURA.md)** - Arquitectura técnica
5. **[CHAT_EJEMPLOS_AVANZADOS.md](CHAT_EJEMPLOS_AVANZADOS.md)** - Casos de uso avanzados

## 🚀 Inicio Rápido (5 minutos)

### 1. Ejecutar Migración

```bash
# En Supabase SQL Editor, ejecuta:
supabase/migrations/011_add_chat_system.sql
```

### 2. Agregar Rutas

```tsx
// En tu Navigator
import { ConversationsScreen, ChatScreen } from './src/screens/common';

<Stack.Screen name="Conversations" component={ConversationsScreen} />
<Stack.Screen name="Chat" component={ChatScreen} />
```

### 3. Agregar Botón de Chat

```tsx
import { ChatButton } from './src/components/chat';

<ChatButton
  barberId={barber.id}
  barberName={barber.full_name}
  barberAvatar={barber.avatar_url}
/>
```

## ✨ Características

- ✅ **Mensajería en tiempo real** - WebSocket con Supabase Realtime
- ✅ **Texto e imágenes** - Envío de mensajes multimedia
- ✅ **Contador de no leídos** - Badge con número de mensajes pendientes
- ✅ **Historial completo** - Todas las conversaciones guardadas
- ✅ **Interfaz moderna** - Diseño tipo WhatsApp
- ✅ **Seguridad RLS** - Row Level Security en base de datos
- ✅ **Optimizado** - Caché, paginación y lazy loading

## 📁 Archivos Creados

### Backend (Supabase)
```
supabase/migrations/
└── 011_add_chat_system.sql          # Migración completa
```

### Servicios
```
src/services/
└── chatService.ts                    # Servicio principal del chat
```

### Pantallas
```
src/screens/common/
├── ConversationsScreen.tsx           # Lista de conversaciones
├── ChatScreen.tsx                    # Pantalla de chat
└── index.ts                          # Exports
```

### Componentes
```
src/components/chat/
├── ChatButton.tsx                    # Botón para iniciar chat
├── UnreadBadge.tsx                   # Badge de no leídos
└── index.ts                          # Exports
```

### Documentación
```
├── CHAT_README.md                    # Este archivo
├── CHAT_IMPLEMENTACION.md            # Guía completa
├── CHAT_INTEGRACION_EJEMPLO.md       # Ejemplos de integración
├── CHAT_QUICK_TEST.md                # Tests rápidos
├── CHAT_ARQUITECTURA.md              # Arquitectura técnica
└── CHAT_EJEMPLOS_AVANZADOS.md        # Casos avanzados
```

## 🎯 Casos de Uso

### Para Clientes
- Consultar disponibilidad antes de reservar
- Enviar foto de referencia del corte deseado
- Confirmar o reprogramar citas
- Hacer preguntas sobre servicios

### Para Barberos
- Responder consultas rápidamente
- Enviar fotos de trabajos anteriores
- Confirmar detalles de la cita
- Mantener comunicación con clientes

## 🔧 API Principal

```typescript
import { chatService } from './src/services/chatService';

// Crear/obtener conversación
const conversationId = await chatService.getOrCreateConversation(
  clientId,
  barberId
);

// Enviar mensaje
await chatService.sendMessage(conversationId, userId, 'Hola!');

// Enviar imagen
const imageUrl = await chatService.uploadChatImage(userId, imageUri);
await chatService.sendMessage(conversationId, userId, 'Mira', imageUrl);

// Obtener mensajes
const messages = await chatService.getMessages(conversationId);

// Marcar como leído
await chatService.markMessagesAsRead(conversationId, userId);

// Tiempo real
chatService.subscribeToConversation(
  conversationId,
  (newMessage) => console.log(newMessage),
  (updatedMessage) => console.log(updatedMessage)
);
```

## 📊 Base de Datos

### Tablas Principales

**conversations**
- Almacena las conversaciones entre cliente y barbero
- Mantiene contador de mensajes no leídos
- Guarda último mensaje para preview

**messages**
- Todos los mensajes de texto e imágenes
- Marca de leído/no leído
- Timestamps para ordenamiento

### Storage

**chat-images**
- Bucket público para imágenes del chat
- Organizado por usuario
- Políticas RLS para seguridad

## 🔐 Seguridad

- **Row Level Security (RLS)** en todas las tablas
- Solo puedes ver tus propias conversaciones
- Solo puedes enviar mensajes donde participas
- Las imágenes solo las puede subir el propietario
- Validación de permisos en cada operación

## ⚡ Performance

- **Índices optimizados** para queries rápidas
- **Paginación** de mensajes (50 por defecto)
- **Caché** de conversaciones
- **Lazy loading** de imágenes
- **Debounce** en búsquedas

## 🎨 Personalización

### Colores

```tsx
// Cambiar color de burbujas
className="bg-purple-500"  // Mis mensajes
className="bg-gray-200"    // Mensajes recibidos
```

### Límites

```typescript
// Mensajes por carga
await chatService.getMessages(conversationId, 100);

// Calidad de imagen
quality: 0.8  // 0.0 - 1.0
```

## 🧪 Testing

```bash
# Ver guía de testing
cat CHAT_QUICK_TEST.md
```

## 📈 Próximas Mejoras

- [ ] Mensajes de voz
- [ ] Videollamadas
- [ ] Indicador de "escribiendo..."
- [ ] Reacciones a mensajes
- [ ] Búsqueda en mensajes
- [ ] Compartir ubicación
- [ ] Mensajes temporales
- [ ] Cifrado end-to-end

## 🐛 Troubleshooting

### Mensajes no llegan en tiempo real
1. Verifica que Realtime esté habilitado en Supabase
2. Revisa las políticas RLS
3. Confirma la suscripción al canal

### Imágenes no se cargan
1. Verifica que el bucket `chat-images` exista
2. Confirma que sea público
3. Revisa las políticas de storage

### Contador de no leídos incorrecto
```typescript
// Forzar recarga
await chatService.markMessagesAsRead(conversationId, userId);
```

## 📚 Recursos

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [React Native Chat UI](https://github.com/FaridSafi/react-native-gifted-chat)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)

## 🤝 Contribuir

Para agregar nuevas features:
1. Lee la arquitectura en `CHAT_ARQUITECTURA.md`
2. Revisa ejemplos avanzados en `CHAT_EJEMPLOS_AVANZADOS.md`
3. Implementa siguiendo los patrones existentes
4. Agrega tests y documentación

## 📞 Soporte

Si encuentras problemas:
1. Revisa `CHAT_QUICK_TEST.md` para diagnóstico
2. Verifica logs de Supabase
3. Confirma que las migraciones se ejecutaron
4. Revisa la consola para errores

## 📝 Changelog

### v1.0.0 (2024-11-07)
- ✅ Sistema de chat completo
- ✅ Mensajes de texto e imágenes
- ✅ Tiempo real con WebSocket
- ✅ Contador de no leídos
- ✅ Interfaz moderna
- ✅ Seguridad RLS
- ✅ Documentación completa

---

## 🎉 ¡Listo para Usar!

El sistema de chat está completamente implementado y documentado. 

**Siguiente paso:** Ejecuta la migración y comienza a integrar en tu app.

```bash
# 1. Ejecutar migración
# Copia supabase/migrations/011_add_chat_system.sql en Supabase SQL Editor

# 2. Agregar rutas al navigator
# Ver CHAT_INTEGRACION_EJEMPLO.md

# 3. Agregar botones de chat
# Ver ejemplos en la documentación

# 4. ¡Probar!
# Sigue CHAT_QUICK_TEST.md
```

**¿Preguntas?** Revisa la documentación completa en los archivos CHAT_*.md

---

**Desarrollado con ❤️ para Trimly** ✂️💬
