# Navigation Structure

This directory contains the navigation configuration for the Barbershop Management App.

## Overview

The app uses a role-based navigation system that displays different interfaces based on the authenticated user's role.

## Navigation Hierarchy

```
RootNavigator (Main entry point)
├── AuthNavigator (Not authenticated)
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── VerifyEmail
│
├── ClientNavigator (Role: cliente)
│   ├── ClientTabs (Bottom tabs)
│   │   ├── Home
│   │   ├── Search
│   │   ├── Appointments
│   │   └── Profile
│   └── Stack Screens
│       ├── BarbershopDetail
│       ├── BarberDetail
│       ├── BookAppointment
│       ├── AppointmentDetail
│       ├── Notifications
│       └── History
│
├── BarberNavigator (Role: barbero)
│   ├── BarberTabs (Bottom tabs)
│   │   ├── Schedule
│   │   ├── Appointments
│   │   ├── History
│   │   └── Profile
│   └── Stack Screens
│       ├── AppointmentDetail
│       ├── ClientProfile
│       └── Notifications
│
├── AdminNavigator (Role: admin - Future)
│   ├── AdminTabs (Bottom tabs)
│   │   ├── Dashboard
│   │   ├── Appointments
│   │   ├── Barbers
│   │   ├── Services
│   │   └── Profile
│   └── Stack Screens
│       ├── BarbershopSettings
│       ├── AddBarber
│       ├── EditBarber
│       ├── AddService
│       ├── EditService
│       ├── AppointmentDetail
│       └── Statistics
│
└── SuperAdminNavigator (Role: super_admin - Future)
    ├── SuperAdminTabs (Bottom tabs)
    │   ├── Dashboard
    │   ├── Barbershops
    │   ├── Users
    │   ├── Statistics
    │   └── Settings
    └── Stack Screens
        ├── AddBarbershop
        ├── EditBarbershop
        ├── BarbershopDetail
        ├── UserManagement
        └── GlobalSettings
```

## Files

- **RootNavigator.tsx**: Main navigator that determines which navigator to show based on authentication state and user role
- **AuthNavigator.tsx**: Stack navigator for authentication screens
- **ClientNavigator.tsx**: Tab + Stack navigator for client users
- **BarberNavigator.tsx**: Tab + Stack navigator for barber users
- **AdminNavigator.tsx**: Tab + Stack navigator for admin users (placeholder for future implementation)
- **SuperAdminNavigator.tsx**: Tab + Stack navigator for super admin users (placeholder for future implementation)

## Role-Based Routing

The `RootNavigator` component uses the `useAuth` hook to determine:
1. If the user is authenticated
2. What role the user has
3. Which navigator to display

Current supported roles in database:
- `cliente` → ClientNavigator
- `barbero` → BarberNavigator

Future roles (placeholders ready):
- `admin` → AdminNavigator
- `super_admin` → SuperAdminNavigator

## Theme Integration

All navigators are integrated with the theme system:
- Header colors adapt to light/dark theme
- Tab bar colors adapt to light/dark theme
- Navigation colors use the theme store

## Adding New Screens

To add a new screen:

1. Create the screen component in the appropriate `src/screens/[role]/` directory
2. Add the screen to the type definitions in `src/types/navigation.ts`
3. Import and add the screen to the appropriate navigator
4. Export the screen from the directory's `index.ts` file

## Navigation Props

All screens receive navigation props typed according to their param list:

```typescript
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ClientStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<ClientStackParamList, 'BarbershopDetail'>;

export const BarbershopDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { barbershopId } = route.params;
  // ...
};
```

## Requirements Fulfilled

This implementation fulfills the following requirements:
- **Requirement 2.3**: Role-based navigation with different interfaces per role
- **Requirement 2.5**: Super admin access to all functionalities (structure ready)
- **Requirement 1.1**: Authentication flow with login/register screens
- **Requirement 16.2**: Theme integration with light/dark mode support
