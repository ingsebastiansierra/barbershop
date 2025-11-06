# AnimatedTabBar Component

## Descripción
Componente de navegación inferior animado con un indicador deslizante que se mueve fluidamente entre las pestañas cuando el usuario navega.

## Características
- ✨ Animación fluida tipo "tren" que recorre hasta la posición del tab seleccionado
- 🎨 Diseño moderno con círculo animado que destaca el tab activo
- 🔄 Reutilizable en todos los roles (Cliente, Barbero, Admin, SuperAdmin)
- 📱 Responsive y adaptable a cualquier número de tabs
- 🎯 Integración perfecta con React Navigation

## Uso
El componente ya está integrado en todos los navegadores. No necesitas hacer nada adicional.

```tsx
<Tab.Navigator
  tabBar={(props) => <AnimatedTabBar {...props} />}
  screenOptions={{
    // ... tus opciones
  }}
>
  {/* Tus screens */}
</Tab.Navigator>
```

## Personalización
Puedes personalizar los colores editando el componente `AnimatedTabBar.tsx`:
- `colors.primary`: Color del círculo animado
- `colors.surface`: Color de fondo del tab bar
- `colors.textSecondary`: Color de los iconos inactivos

## Animación
La animación usa `Animated.spring` con:
- `tension: 68` - Controla la velocidad del rebote
- `friction: 12` - Controla la suavidad del movimiento
- `useNativeDriver: true` - Para mejor rendimiento

Ajusta estos valores en el componente si deseas cambiar el comportamiento de la animación.
