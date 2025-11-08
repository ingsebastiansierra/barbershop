# 🧪 Prueba Rápida del Sistema de Chat

Guía para probar el chat en menos de 5 minutos.

## ✅ Checklist Pre-Test

Antes de empezar, verifica:

- [ ] Migración SQL ejecutada (`011_add_chat_system.sql`)
- [ ] Bucket `chat-images` creado y público en Supabase
- [ ] Rutas agregadas al navigator
- [ ] Al menos 2 usuarios de prueba (1 cliente, 1 barbero)

## 🚀 Test Rápido (5 minutos)

### 1. Verificar Base de Datos (1 min)

```sql
-- En Supabase SQL Editor, ejecuta:

-- Verificar tablas creadas
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM messages;

-- Verificar bucket de imágenes
SELECT * FROM storage.buckets WHERE id = 'chat-images';

-- Verificar funciones
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('get_or_create_conversation', 'mark_messages_as_read');
```

**Resultado esperado:** Todas las consultas deben ejecutarse sin error.

### 2. Test del Servicio (2 min)

Crea un archivo temporal `test-chat.ts`:

```typescript
import { chatService } from './src/services/chatService';

// IDs de prueba (reemplaza con IDs reales de tu DB)
const CLIENT_ID = 'uuid-del-cliente';
const BARBER_ID = 'uuid-del-barbero';

async function testChat() {
  try {
    console.log('🧪 Iniciando tests...\n');

    // Test 1: Crear conversación
    console.log('1️⃣ Creando conversación...');
    const conversationId = await chatService.getOrCreateConversation(
      CLIENT_ID,
      BARBER_ID
    );
    console.log('✅ Conversación creada:', conversationId);

    // Test 2: Enviar mensaje
    console.log('\n2️⃣ Enviando mensaje...');
    const message = await chatService.sendMessage(
      conversationId,
      CLIENT_ID,
      '¡Hola! Este es un mensaje de prueba 🎉'
    );
    console.log('✅ Mensaje enviado:', message.id);

    // Test 3: Obtener mensajes
    console.log('\n3️⃣ Obteniendo mensajes...');
    const messages = await chatService.getMessages(conversationId);
    console.log('✅ Mensajes obtenidos:', messages.length);

    // Test 4: Obtener conversaciones
    console.log('\n4️⃣ Obteniendo conversaciones del cliente...');
    const conversations = await chatService.getConversations(CLIENT_ID);
    console.log('✅ Conversaciones:', conversations.length);

    // Test 5: Contador de no leídos
    console.log('\n5️⃣ Verificando no leídos...');
    const unreadCount = await chatService.getTotalUnreadCount(BARBER_ID);
    console.log('✅ Mensajes no leídos para barbero:', unreadCount);

    // Test 6: Marcar como leído
    console.log('\n6️⃣ Marcando como leído...');
    await chatService.markMessagesAsRead(conversationId, BARBER_ID);
    const newUnreadCount = await chatService.getTotalUnreadCount(BARBER_ID);
    console.log('✅ Nuevos no leídos:', newUnreadCount);

    console.log('\n🎉 ¡Todos los tests pasaron!');
  } catch (error) {
    console.error('❌ Error en tests:', error);
  }
}

testChat();
```

**Ejecutar:**
```bash
npx ts-node test-chat.ts
```

### 3. Test de UI (2 min)

#### En la App:

1. **Login como Cliente**
   - Ve al perfil de un barbero
   - Presiona botón "Mensaje"
   - Verifica que se abra ChatScreen

2. **Enviar Mensaje de Texto**
   - Escribe "Hola, ¿tienes disponibilidad?"
   - Presiona enviar
   - Verifica que aparezca en la burbuja azul

3. **Enviar Imagen**
   - Presiona el botón de cámara 📷
   - Selecciona una imagen
   - Verifica que se suba y muestre

4. **Login como Barbero (otro dispositivo/cuenta)**
   - Ve a la pestaña "Mensajes"
   - Verifica que aparezca la conversación
   - Verifica el badge de "1" no leído
   - Abre la conversación
   - Verifica que el badge desaparezca

5. **Test de Tiempo Real**
   - Mantén ambas apps abiertas
   - Envía mensaje desde cliente
   - Verifica que aparezca instantáneamente en barbero
   - Responde desde barbero
   - Verifica que aparezca en cliente

## 🐛 Problemas Comunes

### Error: "relation conversations does not exist"
**Solución:** Ejecuta la migración SQL

```sql
-- En Supabase SQL Editor
-- Copia y pega todo el contenido de:
supabase/migrations/011_add_chat_system.sql
```

### Error: "Failed to upload image"
**Solución:** Verifica el bucket

```sql
-- Crear bucket si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
```

### Mensajes no llegan en tiempo real
**Solución:** Verifica Realtime en Supabase

1. Ve a Settings > API
2. Verifica que "Realtime" esté habilitado
3. Verifica que las tablas tengan replicación:

```sql
-- Habilitar replicación
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
```

### Badge de no leídos no actualiza
**Solución:** Forzar recarga

```typescript
// En ConversationsScreen.tsx
useEffect(() => {
  const interval = setInterval(() => {
    loadConversations();
  }, 30000); // Cada 30 segundos

  return () => clearInterval(interval);
}, []);
```

### Imágenes no se muestran
**Solución:** Verifica políticas de storage

```sql
-- Verificar políticas
SELECT * FROM storage.policies WHERE bucket_id = 'chat-images';

-- Si no existen, ejecuta de nuevo la sección de storage de la migración
```

## 📊 Verificación Final

Ejecuta este query para ver el estado completo:

```sql
-- Dashboard de Chat
SELECT 
  'Conversaciones' as tipo,
  COUNT(*) as total
FROM conversations
UNION ALL
SELECT 
  'Mensajes',
  COUNT(*)
FROM messages
UNION ALL
SELECT 
  'Imágenes',
  COUNT(*)
FROM storage.objects
WHERE bucket_id = 'chat-images';
```

## ✅ Criterios de Éxito

El sistema está funcionando correctamente si:

- ✅ Se pueden crear conversaciones
- ✅ Los mensajes se envían y reciben
- ✅ Las imágenes se suben y muestran
- ✅ El tiempo real funciona (< 1 segundo de latencia)
- ✅ Los contadores de no leídos actualizan
- ✅ Las notificaciones aparecen
- ✅ No hay errores en consola

## 🎯 Métricas de Performance

Tiempos esperados:
- Crear conversación: < 200ms
- Enviar mensaje: < 300ms
- Subir imagen: < 2s
- Actualización en tiempo real: < 1s
- Cargar conversaciones: < 500ms
- Cargar mensajes: < 400ms

## 📝 Reporte de Test

```
SISTEMA DE CHAT - REPORTE DE PRUEBAS
====================================

Fecha: _______________
Tester: _______________

✅ Base de datos configurada
✅ Servicio funcionando
✅ UI renderiza correctamente
✅ Mensajes de texto funcionan
✅ Imágenes funcionan
✅ Tiempo real funciona
✅ Contadores actualizan
✅ Performance aceptable

Notas adicionales:
_________________________________
_________________________________
_________________________________

Estado: [ ] APROBADO  [ ] REQUIERE AJUSTES
```

## 🚀 Siguiente Paso

Si todos los tests pasan, estás listo para:
1. Integrar en producción
2. Agregar notificaciones push
3. Implementar features adicionales (voz, video, etc.)

---

**¿Algún test falló?** Revisa la sección de troubleshooting en [CHAT_IMPLEMENTACION.md](CHAT_IMPLEMENTACION.md)
