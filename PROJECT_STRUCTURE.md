# Project Structure

This document describes the complete folder structure of the Barbershop Manager application.

## Root Directory

```
barbershop-manager/
├── .kiro/                      # Kiro specifications and configuration
│   └── specs/
│       └── barbershop-management-app/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── assets/                     # Static assets (icons, splash screens)
├── node_modules/              # NPM dependencies
├── src/                       # Source code
│   ├── assets/                # Application assets
│   │   ├── icons/            # Icon files
│   │   └── images/           # Image files
│   ├── components/            # Reusable components
│   │   ├── appointment/      # Appointment-related components
│   │   ├── barbershop/       # Barbershop-related components
│   │   ├── common/           # Common UI components (Button, Input, Card, etc.)
│   │   └── layout/           # Layout components (Header, Footer, etc.)
│   ├── hooks/                 # Custom React hooks
│   ├── navigation/            # Navigation configuration
│   ├── screens/               # Screen components
│   │   ├── admin/            # Admin screens
│   │   ├── auth/             # Authentication screens
│   │   ├── barber/           # Barber screens
│   │   ├── client/           # Client screens
│   │   └── superadmin/       # Super admin screens
│   ├── services/              # API services
│   ├── store/                 # Zustand stores for global state
│   ├── styles/                # Global styles and theme
│   │   ├── colors.ts         # Color palette definitions
│   │   └── theme.ts          # Theme configuration
│   ├── supabase/              # Supabase configuration
│   ├── types/                 # TypeScript type definitions
│   │   ├── models.ts         # Data model types
│   │   └── navigation.ts     # Navigation types
│   └── utils/                 # Utility functions
│       └── constants.ts      # Global constants
├── .env.example               # Environment variables template
├── .gitignore                 # Git ignore rules
├── app.json                   # Expo configuration
├── App.tsx                    # Application entry point
├── babel.config.js            # Babel configuration
├── package.json               # NPM dependencies and scripts
├── README.md                  # Project documentation
├── tailwind.config.js         # Tailwind CSS configuration
└── tsconfig.json              # TypeScript configuration
```

## Key Directories

### `/src/components`
Contains all reusable UI components organized by feature:
- **common/**: Generic components (Button, Input, Card, Modal, Avatar)
- **barbershop/**: Barbershop-specific components (BarbershopCard, BarberCard, ServiceCard)
- **appointment/**: Appointment-related components (AppointmentCard, CalendarPicker, TimeSlotPicker)
- **layout/**: Layout components (Headers, Footers, Containers)

### `/src/screens`
Contains all screen components organized by user role:
- **auth/**: Login, Register, ForgotPassword, VerifyEmail
- **client/**: Client-specific screens (Home, Search, Appointments, Profile, etc.)
- **barber/**: Barber-specific screens (Schedule, Appointments, History, Profile)
- **admin/**: Admin screens (Dashboard, Barbers, Services, Statistics, etc.)
- **superadmin/**: Super admin screens (Dashboard, Barbershops, Users, etc.)

### `/src/services`
API service layer for communicating with Supabase:
- AuthService
- BarbershopService
- BarberService
- AppointmentService
- NotificationService
- WaitlistService
- etc.

### `/src/store`
Zustand stores for global state management:
- authStore: User authentication state
- themeStore: Theme preferences
- notificationStore: Notifications state

### `/src/hooks`
Custom React hooks:
- useAuth: Authentication hook
- useAppointments: Appointments management
- useBarbershops: Barbershops data
- useNotifications: Notifications handling

### `/src/types`
TypeScript type definitions:
- models.ts: Data model interfaces
- navigation.ts: Navigation type definitions

### `/src/utils`
Utility functions and constants:
- constants.ts: Global constants and enums
- validation.ts: Form validation functions
- dateHelpers.ts: Date manipulation utilities
- formatters.ts: Data formatting functions

## Configuration Files

- **app.json**: Expo configuration including app name, version, permissions, and plugins
- **tsconfig.json**: TypeScript compiler configuration with strict mode enabled
- **tailwind.config.js**: Tailwind CSS configuration for NativeWind
- **babel.config.js**: Babel configuration with module resolver for path aliases
- **.env.example**: Template for environment variables (Supabase credentials)

## Next Steps

After completing the base setup, the next tasks involve:
1. Implementing the design system and theme (Task 2)
2. Configuring Supabase and authentication services (Task 3)
3. Creating authentication screens (Task 4)
4. Implementing role-based navigation (Task 5)

Refer to `.kiro/specs/barbershop-management-app/tasks.md` for the complete implementation plan.
