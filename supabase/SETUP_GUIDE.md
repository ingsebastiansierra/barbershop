# Guía de Configuración de Supabase

Esta guía te ayudará a configurar Row Level Security (RLS) y Storage Buckets en tu proyecto de Supabase.

## 📋 Requisitos Previos

- Acceso a tu proyecto de Supabase: https://bsvggmdntyimypntdmzo.supabase.co
- Las tablas ya deben estar creadas en tu base de datos

## 🔐 Paso 1: Configurar Row Level Security (RLS)

### Opción A: Usando el SQL Editor de Supabase (Recomendado)

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido completo del archivo `rls-policies.sql`
5. Haz clic en **Run** para ejecutar el script

### Opción B: Usando la CLI de Supabase

```bash
# Si tienes Supabase CLI instalado
supabase db push --file supabase/rls-policies.sql
```

### ✅ Verificación de RLS

Después de ejecutar el script, verifica que:

1. Todas las tablas tienen RLS habilitado:
   - Ve a **Database** → **Tables**
   - Cada tabla debe mostrar "RLS enabled" ✓

2. Las políticas están creadas:
   - Ve a **Authentication** → **Policies**
   - Deberías ver múltiples políticas para cada tabla

## 📦 Paso 2: Crear Storage Buckets

### 2.1 Crear Bucket: avatars

1. Ve a **Storage** en el menú lateral
2. Haz clic en **New bucket**
3. Configura el bucket:
   - **Name:** `avatars`
   - **Public bucket:** ✓ (marcado)
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp, image/gif`
4. Haz clic en **Create bucket**

### 2.2 Crear Bucket: negocio-logos

1. Haz clic en **New bucket**
2. Configura el bucket:
   - **Name:** `negocio-logos`
   - **Public bucket:** ✓ (marcado)
   - **File size limit:** 5 MB
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp`
3. Haz clic en **Create bucket**

### 2.3 Crear Bucket: shorts-videos

1. Haz clic en **New bucket**
2. Configura el bucket:
   - **Name:** `shorts-videos`
   - **Public bucket:** ✓ (marcado)
   - **File size limit:** 50 MB
   - **Allowed MIME types:** `video/mp4, video/quicktime, video/webm`
3. Haz clic en **Create bucket**

### 2.4 Crear Bucket: shorts-thumbnails

1. Haz clic en **New bucket**
2. Configura el bucket:
   - **Name:** `shorts-thumbnails`
   - **Public bucket:** ✓ (marcado)
   - **File size limit:** 2 MB
   - **Allowed MIME types:** `image/jpeg, image/png, image/webp`
3. Haz clic en **Create bucket**

## 🔒 Paso 3: Aplicar Políticas de Storage

1. Ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido del archivo `storage-setup.sql`
4. Haz clic en **Run**

### ✅ Verificación de Storage Policies

1. Ve a **Storage** → Selecciona un bucket (ej: `avatars`)
2. Haz clic en **Policies**
3. Deberías ver las políticas creadas:
   - `usuarios_upload_own_avatar`
   - `usuarios_update_own_avatar`
   - `usuarios_delete_own_avatar`
   - `avatars_public_read`

## 🧪 Paso 4: Probar la Configuración

### Probar RLS

Puedes probar las políticas RLS usando el SQL Editor:

```sql
-- Simular un usuario cliente
SET request.jwt.claims.sub = 'user-uuid-here';

-- Intentar ver usuarios (debería ver solo barberos y su propio perfil)
SELECT * FROM public.usuarios;

-- Intentar ver citas (debería ver solo sus propias citas)
SELECT * FROM public.citas;
```

### Probar Storage

1. Intenta subir un archivo desde tu aplicación
2. Verifica que se cree en la estructura correcta: `avatars/user-id/filename.jpg`
3. Verifica que puedas acceder a la URL pública del archivo

## 📊 Resumen de Políticas RLS

### Tabla: usuarios
- ✓ Los usuarios pueden ver su propio perfil
- ✓ Todos pueden ver perfiles de barberos activos
- ✓ Los usuarios pueden actualizar su propio perfil
- ✓ Los usuarios pueden crear su propio perfil (registro)

### Tabla: negocios
- ✓ Todos pueden ver negocios
- ✓ Usuarios autenticados pueden crear negocios
- ✓ Barberos pueden actualizar su propio negocio

### Tabla: servicios
- ✓ Todos pueden ver servicios activos
- ✓ Barberos pueden crear/actualizar/eliminar servicios de su negocio

### Tabla: citas
- ✓ Clientes pueden ver sus propias citas
- ✓ Barberos pueden ver citas de su negocio
- ✓ Clientes pueden crear y actualizar sus citas
- ✓ Barberos pueden actualizar y eliminar citas de su negocio

### Tabla: fila
- ✓ Clientes pueden ver su posición en la fila
- ✓ Barberos pueden ver la fila de su negocio
- ✓ Clientes pueden unirse y actualizar su entrada
- ✓ Barberos pueden actualizar y eliminar entradas de su negocio

### Tabla: shorts
- ✓ Todos pueden ver shorts activos
- ✓ Barberos pueden crear/actualizar/eliminar shorts de su negocio

## 🎯 Buckets de Storage Creados

1. **avatars** - Avatares de usuarios (5MB, imágenes)
2. **negocio-logos** - Logos de barberías (5MB, imágenes)
3. **shorts-videos** - Videos cortos (50MB, videos)
4. **shorts-thumbnails** - Miniaturas de videos (2MB, imágenes)

## 🔧 Funciones Auxiliares Creadas

- `is_barbero_of_negocio(negocio_uuid)` - Verifica si un usuario es barbero de un negocio
- `get_user_negocio_id()` - Obtiene el negocio_id del usuario actual
- `handle_updated_at()` - Actualiza automáticamente el campo updated_at

## 📈 Índices Creados

Se crearon índices para mejorar el rendimiento de consultas frecuentes:
- Índices en `usuarios` (rol, negocio_id, email)
- Índices en `citas` (cliente_id, barbero_id, negocio_id, fecha, estado)
- Índices en `fila` (negocio_id, cliente_id, estado)
- Índices en `servicios` y `shorts` (negocio_id)

## ⚠️ Notas Importantes

1. **Seguridad**: Las políticas RLS protegen tus datos a nivel de base de datos
2. **Performance**: Los índices mejoran el rendimiento de las consultas
3. **Storage**: Los buckets públicos permiten acceso directo a las URLs
4. **Triggers**: Los triggers actualizan automáticamente `updated_at`

## 🐛 Solución de Problemas

### Error: "new row violates row-level security policy"
- Verifica que el usuario esté autenticado
- Verifica que el usuario tenga los permisos correctos (rol, negocio_id)

### Error al subir archivos a Storage
- Verifica que el bucket exista
- Verifica que las políticas de Storage estén aplicadas
- Verifica que el usuario esté autenticado

### No puedo ver datos en las tablas
- Verifica que RLS esté habilitado
- Verifica que las políticas permitan SELECT
- Usa el SQL Editor con `SET request.jwt.claims.sub` para probar

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en **Database** → **Logs**
2. Verifica las políticas en **Authentication** → **Policies**
3. Consulta la documentación de Supabase: https://supabase.com/docs

---

**¡Configuración completada!** 🎉

Tu base de datos ahora está protegida con RLS y lista para usar con la aplicación.
