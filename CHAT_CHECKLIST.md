# ✅ Checklist de Integración del Chat

## 🎯 Antes de Empezar

- [ ] Tengo acceso a Supabase SQL Editor
- [ ] Tengo la app corriendo localmente
- [ ] Tengo al menos 2 cuentas de prueba (1 cliente, 1 barbero)

---

## 📦 Paso 1: Base de Datos

- [ ] Abrir Supabase Dashboard
- [ ] Ir a SQL Editor
- [ ] Copiar contenido de `supabase/migrations/011_add_chat_system.sql`
- [ ] Ejecutar la migración
- [ ] Verificar que no haya errores
- [ ] Verificar tablas creadas:
  ```sql
  SELECT COUNT(*) FROM conversations;
  SELECT COUNT(*) FROM messages;
  ```
- [ ] Verificar bucket creado:
  ```sql
  SELECT * FROM storage.buckets WHERE id = 'chat-images';
  ```

---

## 🔧 Paso 2: Código (Ya Hecho ✅)

- [x] Servicio de chat creado (`src/services/chatService.ts`)
- [x] Pantallas de chat creadas (`src/screens/common/`)
- [x] Componentes de chat creados (`src/components/chat/`)
- [x] Navegación actualizada (ClientNavigator y BarberNavigator)
- [x] Tipos de navegación actualizados
- [x] Botones de chat agregados en pantallas
- [x] Colores actualizados a tema barbería

---

## 🚀 Paso 3: Reiniciar App

- [ ] Detener servidor de Metro (Ctrl+C)
- [ ] Limpiar caché:
  ```bash
  npx react-native start --reset-cache
  ```
- [ ] O simplemente:
  ```bash
  npm start
  ```
- [ ] Esperar a que compile
- [ ] Verificar que no haya errores en consola

---

## 🧪 Paso 4: Pruebas Básicas

### Como Cliente:

- [ ] Abrir la app
- [ ] Verificar que aparezca tab "Mensajes" en navegación inferior
- [ ] Ir a "Inicio" o "Buscar"
- [ ] Seleccionar una barbería
- [ ] Ir al tab "Barberos"
- [ ] Verificar que cada barbero tenga botón "💬 Mensaje"
- [ ] Presionar botón de chat
- [ ] Verificar que se abra pantalla de chat
- [ ] Escribir mensaje: "Hola, ¿tienes disponibilidad?"
- [ ] Presionar enviar
- [ ] Verificar que el mensaje aparezca en la burbuja marrón (#582308)
- [ ] Presionar botón de cámara 📷
- [ ] Seleccionar una imagen
- [ ] Verificar que la imagen se suba y muestre

### Como Barbero:

- [ ] Abrir la app en otro dispositivo/cuenta
- [ ] Verificar que aparezca tab "Mensajes" en navegación inferior
- [ ] Ir al tab "Mensajes"
- [ ] Verificar que aparezca la conversación con el cliente
- [ ] Verificar que haya un badge rojo con "1"
- [ ] Abrir la conversación
- [ ] Verificar que el badge desaparezca
- [ ] Verificar que aparezca el mensaje del cliente
- [ ] Responder: "¡Hola! Sí, tengo disponibilidad mañana"
- [ ] Verificar que el mensaje se envíe

---

## ⚡ Paso 5: Prueba de Tiempo Real

- [ ] Mantener ambas apps abiertas (cliente y barbero)
- [ ] Desde cliente: Enviar mensaje "Perfecto, ¿a qué hora?"
- [ ] Verificar que aparezca **instantáneamente** en barbero (< 1 segundo)
- [ ] Desde barbero: Responder "A las 3pm está bien?"
- [ ] Verificar que aparezca instantáneamente en cliente
- [ ] Enviar 3-4 mensajes más de ida y vuelta
- [ ] Verificar que todos lleguen en tiempo real

---

## 🎨 Paso 6: Verificar UI

### Pantalla de Conversaciones:

- [ ] Muestra avatar del otro usuario
- [ ] Muestra nombre del otro usuario
- [ ] Muestra último mensaje
- [ ] Muestra tiempo transcurrido ("hace 2 min")
- [ ] Muestra badge de no leídos (si hay)
- [ ] Pull to refresh funciona

### Pantalla de Chat:

- [ ] Header muestra avatar y nombre del otro usuario
- [ ] Mensajes propios en burbuja marrón (#582308)
- [ ] Mensajes recibidos en burbuja gris
- [ ] Timestamps visibles
- [ ] Input de texto funciona
- [ ] Botón de cámara funciona
- [ ] Botón de enviar funciona
- [ ] Scroll automático al final
- [ ] Imágenes se muestran correctamente

---

## 🔍 Paso 7: Verificar Integraciones

### BarbershopDetailScreen:

- [ ] Ir a una barbería
- [ ] Ver tab "Barberos"
- [ ] Verificar que cada barbero tenga botón de chat
- [ ] Presionar botón
- [ ] Verificar que abra chat con ese barbero

### BarberDetailScreen:

- [ ] Ir al perfil de un barbero
- [ ] Verificar que haya botón de chat en la parte inferior
- [ ] Presionar botón
- [ ] Verificar que abra chat

### AppointmentDetailScreen (Cliente):

- [ ] Ir a "Citas"
- [ ] Seleccionar una cita
- [ ] Scroll hasta sección del barbero
- [ ] Verificar que haya sección "¿Tienes alguna pregunta?"
- [ ] Verificar que haya botón de chat
- [ ] Presionar botón
- [ ] Verificar que abra chat con el barbero de esa cita

### BarberAppointmentDetailScreen (Barbero):

- [ ] Como barbero, ir a "Citas"
- [ ] Seleccionar una cita
- [ ] Scroll hasta sección del cliente
- [ ] Verificar que haya sección "Contactar cliente"
- [ ] Verificar que haya botón de chat
- [ ] Presionar botón
- [ ] Verificar que abra chat con el cliente de esa cita

---

## 🎯 Paso 8: Pruebas Avanzadas

### Contador de No Leídos:

- [ ] Como cliente, enviar mensaje a barbero
- [ ] Cerrar la conversación
- [ ] Como barbero, ir al tab "Mensajes"
- [ ] Verificar que aparezca badge con "1"
- [ ] Abrir la conversación
- [ ] Verificar que el badge desaparezca
- [ ] Salir de la conversación
- [ ] Verificar que el badge no vuelva a aparecer

### Múltiples Conversaciones:

- [ ] Como cliente, iniciar chat con 3 barberos diferentes
- [ ] Enviar mensaje a cada uno
- [ ] Ir al tab "Mensajes"
- [ ] Verificar que aparezcan las 3 conversaciones
- [ ] Verificar que estén ordenadas por última actividad
- [ ] Como barbero, verificar que aparezcan las 3 conversaciones

### Imágenes:

- [ ] Enviar imagen desde cliente
- [ ] Verificar que se suba (puede tardar 1-2 segundos)
- [ ] Verificar que aparezca en el chat
- [ ] Verificar que el barbero la reciba
- [ ] Presionar la imagen
- [ ] Verificar que se pueda ver en tamaño completo

---

## 🐛 Paso 9: Solución de Problemas

Si algo no funciona, marca lo que aplique:

- [ ] Reinicié el servidor de Metro
- [ ] Limpié caché con `--reset-cache`
- [ ] Verifiqué que la migración SQL se ejecutó correctamente
- [ ] Verifiqué que el bucket `chat-images` existe y es público
- [ ] Verifiqué que Realtime está habilitado en Supabase
- [ ] Revisé logs de Supabase para errores
- [ ] Revisé consola de la app para errores
- [ ] Verifiqué que tengo conexión a internet
- [ ] Probé con otra cuenta de usuario

---

## ✅ Paso 10: Confirmación Final

Si todos los checks anteriores están marcados:

- [ ] ✅ El chat funciona correctamente
- [ ] ✅ Los mensajes llegan en tiempo real
- [ ] ✅ Las imágenes se envían y reciben
- [ ] ✅ El contador de no leídos funciona
- [ ] ✅ La UI se ve bien
- [ ] ✅ No hay errores en consola
- [ ] ✅ Estoy satisfecho con el resultado

---

## 🎉 ¡Felicidades!

Si llegaste hasta aquí y todos los checks están marcados, tu sistema de chat está **100% funcional** y listo para producción.

---

## 📊 Resumen de Progreso

```
Total de Checks: 80+
Completados: ___
Pendientes: ___
Porcentaje: ___%
```

---

## 📞 ¿Necesitas Ayuda?

Si algún check falló:

1. **Revisa:** `CHAT_QUICK_TEST.md` para diagnóstico detallado
2. **Consulta:** `CHAT_INTEGRACION_COMPLETA.md` para soluciones
3. **Verifica:** Logs de Supabase y consola de la app

---

**¡Éxito con tu implementación!** 🚀💬✂️
