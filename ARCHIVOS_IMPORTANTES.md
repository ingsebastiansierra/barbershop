# 📁 Archivos Importantes del Proyecto

## 📄 Documentación Principal

### `README.md`
Documentación principal del proyecto con:
- Características
- Instalación
- Configuración
- Estructura del proyecto

### `RECUPERACION_CONTRASEÑA.md`
Guía de recuperación de contraseña:
- Para usuarios
- Para administradores
- Configuración
- Solución de problemas

### `TOAST_NOTIFICATIONS.md`
Documentación del sistema de notificaciones Toast:
- Tipos de notificaciones
- Ejemplos de uso
- Personalización

---

## 🗄️ Scripts SQL (`supabase/`)

### Scripts Esenciales:
- `setup-admin-system.sql` - Configuración inicial
- `create-super-admin-user.sql` - Crear super admin
- `rls-policies.sql` - Políticas de seguridad
- `storage-setup.sql` - Configuración de almacenamiento
- `storage-cleanup.sql` - Limpieza de archivos

### Documentación:
- `SETUP_GUIDE.md` - Guía completa de configuración
- `README.md` - Índice de scripts SQL

---

## 🌐 Página Web (`public/`)

### Archivos:
- `index.html` - Página de recuperación de contraseña
- `vercel.json` - Configuración de Vercel
- `README.md` - Instrucciones de deployment

**URL actual**: https://proyecto-barber-paginas.vercel.app/

---

## 🔧 Configuración

### `.env`
Variables de entorno (no incluido en git):
```env
EXPO_PUBLIC_SUPABASE_URL=tu_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_key
```

### `app.config.js`
Configuración de Expo:
- Nombre de la app
- Bundle identifier
- Permisos
- Scheme para deep linking

---

## 📱 Código Fuente (`src/`)

### Carpetas Principales:
- `components/` - Componentes reutilizables
- `screens/` - Pantallas de la app
- `navigation/` - Configuración de navegación
- `services/` - Servicios (auth, API)
- `store/` - Estado global (Zustand)
- `utils/` - Utilidades (toast, validación)
- `supabase/` - Cliente y tipos de Supabase

---

## 🚫 Archivos Eliminados

Se eliminaron archivos temporales y de diagnóstico:
- ❌ Scripts SQL de prueba
- ❌ Documentación redundante
- ❌ Archivos de configuración antiguos
- ❌ Guías paso a paso temporales

---

## ✅ Resultado

Proyecto limpio y organizado con solo los archivos esenciales.
