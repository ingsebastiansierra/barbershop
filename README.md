# 💈 Barbershop Manager

Sistema de gestión para barberías desarrollado con React Native y Expo.

## 🚀 Características

- ✅ Sistema de autenticación con roles (Cliente, Barbero, Admin, Super Admin)
- ✅ Gestión de citas y reservas
- ✅ Perfiles de usuario personalizados
- ✅ Recuperación de contraseña por email
- ✅ Notificaciones Toast profesionales
- ✅ Tema claro/oscuro
- ✅ Base de datos Supabase

## 📦 Tecnologías

- **React Native** - Framework móvil
- **Expo** - Herramientas de desarrollo
- **TypeScript** - Tipado estático
- **Supabase** - Backend y base de datos
- **Zustand** - Gestión de estado
- **React Navigation** - Navegación
- **React Query** - Gestión de datos
- **Toast Messages** - Notificaciones

## 🛠️ Instalación

```bash
# Instalar dependencias
npm install

# Iniciar en desarrollo
npx expo start

# Limpiar caché
npx expo start -c
```

## 🔐 Configuración de Supabase

### Variables de Entorno

Crea un archivo `.env` con:

```env
EXPO_PUBLIC_SUPABASE_URL=tu_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

### Scripts SQL Importantes

Los scripts SQL están en la carpeta `supabase/`:

- `setup-admin-system.sql` - Configuración inicial del sistema
- `create-super-admin-user.sql` - Crear super administrador
- `rls-policies.sql` - Políticas de seguridad
- `storage-setup.sql` - Configuración de almacenamiento

## 📱 Recuperación de Contraseña

La página web para recuperación de contraseña está en `public/index.html`.

### Deployment en Vercel

```bash
cd public
vercel --prod
```

Luego configura la URL en Supabase:
- Authentication → URL Configuration → Redirect URLs
- Agrega: `https://tu-proyecto.vercel.app/`

## 👥 Roles de Usuario

### Cliente
- Ver barberías y barberos
- Reservar citas
- Ver historial de citas
- Gestionar perfil

### Barbero
- Ver citas asignadas
- Gestionar disponibilidad
- Ver historial de clientes

### Admin
- Gestionar barberos
- Ver estadísticas de la barbería
- Configurar servicios

### Super Admin
- Gestión completa de barberías
- Gestión de todos los usuarios
- Estadísticas globales
- Configuración del sistema

## 📂 Estructura del Proyecto

```
src/
├── components/     # Componentes reutilizables
├── hooks/          # Custom hooks
├── navigation/     # Configuración de navegación
├── screens/        # Pantallas de la app
│   ├── auth/       # Autenticación
│   ├── client/     # Cliente
│   ├── barber/     # Barbero
│   ├── admin/      # Admin
│   └── superadmin/ # Super Admin
├── services/       # Servicios (API, auth, etc.)
├── store/          # Estado global (Zustand)
├── styles/         # Estilos y temas
├── supabase/       # Configuración de Supabase
├── types/          # Tipos de TypeScript
└── utils/          # Utilidades

supabase/           # Scripts SQL
public/             # Página web de recuperación
```

## 🎨 Notificaciones Toast

Usa el helper `showToast` para notificaciones profesionales:

```typescript
import { showToast } from './src/utils/toast';

// Éxito
showToast.success('Operación completada', '✅ Éxito');

// Error
showToast.error('Algo salió mal', '❌ Error');

// Info
showToast.info('Información importante', 'ℹ️ Info');

// Cargando
showToast.loading('Procesando...');
```

## 🔧 Scripts Útiles

```bash
# Desarrollo
npm start

# Limpiar caché
npm start -- --clear

# Android
npm run android

# iOS
npm run ios

# Web
npm run web
```

## 📝 Notas Importantes

- Las políticas RLS están configuradas para seguridad
- Los usuarios deben verificar su email al registrarse
- Las contraseñas están encriptadas con bcrypt
- Los enlaces de recuperación expiran en 1 hora

## 🐛 Solución de Problemas

### Error al iniciar sesión
- Verifica que las políticas RLS estén configuradas
- Ejecuta `supabase/rls-policies.sql`

### Error de recursión infinita
- Las políticas RLS están mal configuradas
- Ejecuta el script de limpieza de políticas

### Email de recuperación no llega
- Verifica la configuración de SMTP en Supabase
- Revisa la carpeta de spam
- Verifica que el email esté registrado

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👨‍💻 Desarrollo

Desarrollado con ❤️ para gestión profesional de barberías.

---

**Versión**: 1.0.0  
**Última actualización**: 2025-01-05
