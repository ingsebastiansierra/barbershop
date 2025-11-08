# 🚀 Chat - Inicio Rápido (2 minutos)

## ✅ Paso 1: Verificar Migración SQL

```sql
-- En Supabase SQL Editor, verifica que las tablas existan:
SELECT COUNT(*) FROM conversations;
SELECT COUNT(*) FROM messages;
```

Si da error, ejecuta la migración:
```sql
-- Copia y pega todo el contenido de:
supabase/migrations/011_add_chat_system.sql
```

---

## ✅ Paso 2: Reiniciar la App

```bash
# Detén el servidor de Metro (Ctrl+C)

# Limpia caché
npx react-native start --reset-cache

# O simplemente
npm start
```

---

## ✅ Paso 3: Probar el Chat

### Como Cliente:

1. Abre la app
2. Ve a "Inicio" o "Buscar"
3. Selecciona una barbería
4. Ve al tab "Barberos"
5. Presiona el botón "💬 Mensaje" junto a cualquier barbero
6. Envía un mensaje: "Hola, ¿tienes disponibilidad?"

### Como Barbero:

1. Abre la app en otro dispositivo/cuenta
2. Ve al tab "Mensajes" (nuevo tab en la navegación inferior)
3. Verifica que aparezca la conversación
4. Verifica el badge rojo con "1"
5. Abre la conversación
6. Responde: "¡Hola! Sí, tengo disponibilidad"

---

## ✅ Paso 4: Verificar Tiempo Real

1. Mantén ambas apps abiertas
2. Envía un mensaje desde el cliente
3. Verifica que aparezca **instantáneamente** en el barbero
4. Responde desde el barbero
5. Verifica que aparezca en el cliente

---

## 🎉 ¡Listo!

Si todo funciona, tu chat está **100% operativo**.

### Dónde encontrar el chat:

**Cliente:**
- Tab "Mensajes" (navegación inferior)
- Botón "💬" en lista de barberos
- Botón "💬" en perfil de barbero
- Botón en detalles de cita

**Barbero:**
- Tab "Mensajes" (navegación inferior)
- Botón en detalles de cita

---

## 🐛 Si algo no funciona:

### Error: "Cannot find module"
```bash
# Limpia todo
rm -rf node_modules
npm install
npx react-native start --reset-cache
```

### Mensajes no llegan en tiempo real
```sql
-- En Supabase SQL Editor:
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
```

### Imágenes no se cargan
```sql
-- Verifica el bucket:
SELECT * FROM storage.buckets WHERE id = 'chat-images';

-- Si no existe:
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-images', 'chat-images', true);
```

---

## 📚 Más Información

- `CHAT_INTEGRACION_COMPLETA.md` - Resumen completo
- `CHAT_IMPLEMENTACION.md` - Guía detallada
- `CHAT_QUICK_TEST.md` - Tests completos
- `CHAT_EJEMPLOS_AVANZADOS.md` - Features avanzados

---

**¡Disfruta tu nuevo sistema de chat!** 💬✂️
