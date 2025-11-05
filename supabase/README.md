# 📁 Scripts SQL de Supabase

Scripts SQL para configurar y mantener la base de datos.

## 📋 Scripts Principales

### `setup-admin-system.sql`
Configuración inicial del sistema de administración.
- Crea tablas principales
- Configura roles y permisos
- Establece políticas RLS básicas

**Cuándo ejecutar**: Una sola vez al inicio del proyecto

### `create-super-admin-user.sql`
Crea el usuario super administrador inicial.

**Cuándo ejecutar**: Después de `setup-admin-system.sql`

### `rls-policies.sql`
Políticas de seguridad Row Level Security (RLS).
- Políticas para tabla `usuarios`
- Políticas para otras tablas

**Cuándo ejecutar**: 
- Al inicio del proyecto
- Si hay problemas de permisos
- Después de cambios en la estructura

### `storage-setup.sql`
Configuración del almacenamiento de archivos.
- Bucket para avatares
- Políticas de acceso

**Cuándo ejecutar**: Si vas a usar subida de imágenes

### `storage-cleanup.sql`
Limpia archivos huérfanos del storage.

**Cuándo ejecutar**: Mantenimiento periódico

### `SETUP_GUIDE.md`
Guía completa de configuración paso a paso.

---

## 🚀 Orden de Ejecución (Primera vez)

1. `setup-admin-system.sql`
2. `create-super-admin-user.sql`
3. `rls-policies.sql`
4. `storage-setup.sql` (opcional)

## 🔧 Mantenimiento

- **Problemas de permisos**: Ejecuta `rls-policies.sql`
- **Limpiar storage**: Ejecuta `storage-cleanup.sql`

## 📝 Notas

- Ejecuta los scripts en **SQL Editor** de Supabase Dashboard
- Verifica que no haya errores después de cada script
- Haz backup antes de ejecutar scripts en producción
