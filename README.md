# Barbershop Manager

Una aplicación móvil multiplataforma para la gestión de barberías construida con React Native y Expo SDK 54.

## 🚀 Características

- **Multi-rol**: Soporte para súper administradores, administradores de barbería, barberos y clientes
- **Gestión de Citas**: Sistema completo de agendamiento con disponibilidad en tiempo real
- **Lista de Espera**: Notificaciones automáticas cuando se libera un horario
- **Notificaciones Push**: Recordatorios y actualizaciones en tiempo real
- **Temas**: Soporte para modo claro y oscuro
- **Geolocalización**: Búsqueda de barberías cercanas
- **Estadísticas**: Dashboards con métricas y reportes

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Expo CLI
- Cuenta de Supabase (para backend)

## 🛠️ Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd barbershop-manager
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales de Supabase:
```
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

4. Iniciar el servidor de desarrollo:
```bash
npm start
```

## 📱 Ejecutar en Dispositivos

### Android
```bash
npm run android
```

### iOS
```bash
npm run ios
```

### Web
```bash
npm run web
```

## 🏗️ Estructura del Proyecto

```
barbershop-manager/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── common/       # Botones, inputs, cards, modals
│   │   ├── barbershop/   # Componentes específicos de barberías
│   │   ├── appointment/  # Componentes de citas
│   │   └── layout/       # Headers, footers, containers
│   ├── screens/          # Pantallas de la app
│   │   ├── auth/         # Login, registro, verificación
│   │   ├── client/       # Pantallas del cliente
│   │   ├── barber/       # Pantallas del barbero
│   │   ├── admin/        # Pantallas del admin de barbería
│   │   └── superadmin/   # Pantallas del súper admin
│   ├── navigation/       # Configuración de navegación
│   ├── hooks/            # Custom hooks
│   ├── services/         # Servicios de API
│   ├── supabase/         # Configuración de Supabase
│   ├── store/            # Estado global con Zustand
│   ├── utils/            # Utilidades
│   ├── styles/           # Estilos globales y tema
│   ├── assets/           # Imágenes, iconos, fuentes
│   └── types/            # TypeScript types
├── App.tsx               # Punto de entrada
├── app.json              # Configuración de Expo
├── tsconfig.json         # Configuración de TypeScript
└── tailwind.config.js    # Configuración de Tailwind
```

## 🔧 Stack Tecnológico

- **Framework**: React Native con Expo SDK 54
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Navegación**: React Navigation v6
- **Estado Global**: Zustand + React Query
- **Estilos**: NativeWind (Tailwind para React Native)
- **Fechas**: date-fns
- **Almacenamiento Local**: AsyncStorage
- **Notificaciones**: Expo Notifications
- **Imágenes**: Expo Image Picker + Expo Image

## 📚 Documentación

Para más información sobre el diseño y arquitectura del proyecto, consulta:
- [Requisitos](.kiro/specs/barbershop-management-app/requirements.md)
- [Diseño](.kiro/specs/barbershop-management-app/design.md)
- [Plan de Implementación](.kiro/specs/barbershop-management-app/tasks.md)

## 🧪 Testing

```bash
# Verificar tipos de TypeScript
npm run type-check

# Ejecutar linter
npm run lint
```

## 📄 Licencia

Este proyecto es privado y confidencial.

## 👥 Equipo

Desarrollado para la gestión eficiente de barberías.
