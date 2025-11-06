# Setup Rápido - Shorts para Barberos

## ✅ Pasos Completados

1. ✅ Migración SQL ejecutada en Supabase
2. ✅ Código TypeScript implementado
3. ✅ Navegación configurada
4. ✅ Permisos configurados en app.config.js

## 🚀 Pasos Finales

### 1. Verificar el Storage Bucket en Supabase

Ve a tu dashboard de Supabase:
1. Navega a **Storage** en el menú lateral
2. Verifica que existe el bucket **`barber-shorts`**
3. Si no existe, créalo manualmente:
   - Click en "New bucket"
   - Name: `barber-shorts`
   - Public: ✅ (activado)
   - Click "Create bucket"

### 2. Verificar las Políticas de Storage

En el bucket `barber-shorts`, verifica que existan estas políticas:
- ✅ Anyone can view shorts media (SELECT)
- ✅ Barbers can upload their own shorts (INSERT)
- ✅ Barbers can update their own shorts (UPDATE)
- ✅ Barbers can delete their own shorts (DELETE)

Si no existen, la migración SQL debería haberlas creado. Si hay error, puedes crearlas manualmente desde el dashboard.

### 3. Reiniciar la App

```bash
# Detener el servidor si está corriendo
# Luego reiniciar

npm start
```

O si usas Expo:
```bash
expo start --clear
```

### 4. Probar la Funcionalidad

Como **Barbero**:

1. **Acceder a Shorts**:
   - Inicia sesión como barbero
   - Ve al tab "Shorts" (icono de película)
   - Deberías ver una pantalla vacía con el mensaje "No tienes shorts aún"

2. **Subir un Short**:
   - Presiona el botón "+" flotante
   - Selecciona "Subir Imagen" o "Subir Video"
   - Elige un archivo de tu galería
   - Agrega título, descripción y tags (opcional)
   - Presiona "Publicar Short"

3. **Ver y Editar**:
   - Toca un short para ver detalles
   - Presiona el icono de editar
   - Modifica la información
   - Guarda los cambios

4. **Eliminar**:
   - En la vista de grid, presiona el icono de basura
   - Confirma la eliminación

## 🐛 Solución de Problemas

### Error: "Storage bucket not found"
**Solución**: Crea el bucket manualmente en Supabase Dashboard → Storage

### Error: "Permission denied"
**Solución**: Verifica las políticas RLS en las tablas y en storage

### Error: "Cannot read properties of undefined"
**Solución**: Asegúrate de que el usuario esté autenticado y tenga rol de barbero

### Warning: "MediaTypeOptions deprecated"
**Solución**: ✅ Ya corregido. Ahora usa `['images']` y `['videos']` en lugar de `MediaTypeOptions`

### Error: "Video muy largo" con videos cortos
**Solución**: ✅ Ya corregido. La duración ahora se valida correctamente (viene en milisegundos, se compara con 60000ms = 60s)

### Los videos no se reproducen
**Solución**: Por ahora solo se muestra el preview. Para reproducción completa, necesitarías agregar un reproductor de video (react-native-video o expo-av)

### Las imágenes no cargan
**Solución**: 
1. Verifica que el bucket sea público
2. Verifica la URL en Supabase Storage
3. Revisa los logs de la consola

## 📱 Permisos de la App

La app solicitará estos permisos cuando sea necesario:
- **Galería de fotos**: Para seleccionar imágenes/videos
- **Cámara** (futuro): Para grabar videos directamente

Los permisos ya están configurados en `app.config.js`:
```javascript
plugins: ['expo-notifications', 'expo-image-picker', 'expo-location']
```

## 🎯 Próximos Pasos Opcionales

### 1. Agregar Reproductor de Video
Para reproducir videos en lugar de solo mostrar preview:

```bash
npm install expo-av
```

Luego actualiza `ShortDetailScreen.tsx` para usar `<Video>` component.

### 2. Agregar Compresión de Video
Para reducir el tamaño de los videos:

```bash
npm install react-native-compressor
```

### 3. Crear Feed Público de Shorts
Crea una nueva pantalla para clientes donde puedan ver shorts de todas las barberías.

### 4. Agregar Comentarios
Crea una tabla `shorts_comments` y agrega la funcionalidad de comentarios.

## 📊 Verificar en Supabase

### Tablas Creadas
Ve a **Database** → **Tables** y verifica:
- ✅ `barber_shorts`
- ✅ `shorts_likes`
- ✅ `shorts_views`

### Funciones y Triggers
Ve a **Database** → **Functions** y verifica:
- ✅ `update_short_likes_count()`
- ✅ `update_short_views_count()`
- ✅ `update_barber_shorts_updated_at()`

### Storage
Ve a **Storage** y verifica:
- ✅ Bucket `barber-shorts` existe
- ✅ Es público
- ✅ Tiene políticas configuradas

## ✨ ¡Listo!

Tu funcionalidad de Shorts está completamente implementada. Los barberos ahora pueden:
- ✅ Subir videos cortos (máx 60 segundos)
- ✅ Subir imágenes de sus trabajos
- ✅ Agregar títulos, descripciones y tags
- ✅ Ver estadísticas (vistas y likes)
- ✅ Editar y eliminar sus shorts
- ✅ Activar/desactivar shorts

## 📚 Documentación Adicional

Para más detalles, consulta:
- `SHORTS_IMPLEMENTACION.md` - Documentación completa
- `src/services/shortsService.ts` - API de shorts
- `src/hooks/useShorts.ts` - Hooks personalizados
- `src/components/shorts/ShortCard.tsx` - Componente reutilizable
