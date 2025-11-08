# 🎨 Guía de Colores - Trimly Barbershop Theme

## 🌈 Paleta de Colores Principal

### Color Primario - Marrón Barbería
```
#582308 - Principal (Brown Barbershop)
#3D1806 - Oscuro
#7A3010 - Claro
```

**Uso:**
- Botones principales
- Headers
- Elementos de acción importantes
- Iconos destacados
- Badges de notificación

**Ejemplo:**
```tsx
<TouchableOpacity className="bg-[#582308] py-3 px-6 rounded-lg">
  <Text className="text-white font-semibold">Reservar Cita</Text>
</TouchableOpacity>
```

---

### Color Secundario - Dorado/Beige
```
#D4A574 - Principal (Gold/Beige)
#B8894F - Oscuro
#E5C9A3 - Claro
```

**Uso:**
- Botones secundarios
- Elementos decorativos
- Highlights
- Badges de premium
- Detalles elegantes

**Ejemplo:**
```tsx
<View className="bg-[#D4A574] rounded-full px-4 py-2">
  <Text className="text-white text-sm font-semibold">Premium</Text>
</View>
```

---

### Color de Acento - Camel/Tan
```
#C19A6B - Principal (Camel)
#D4B896 - Claro
```

**Uso:**
- Elementos interactivos secundarios
- Bordes destacados
- Fondos sutiles
- Separadores elegantes

---

## 🎯 Aplicación por Componente

### Botones

```tsx
// Botón Principal
<TouchableOpacity className="bg-[#582308] active:bg-[#3D1806] py-3 px-6 rounded-lg">
  <Text className="text-white font-semibold">Acción Principal</Text>
</TouchableOpacity>

// Botón Secundario
<TouchableOpacity className="bg-[#D4A574] active:bg-[#B8894F] py-3 px-6 rounded-lg">
  <Text className="text-white font-semibold">Acción Secundaria</Text>
</TouchableOpacity>

// Botón Outline
<TouchableOpacity className="border-2 border-[#582308] py-3 px-6 rounded-lg">
  <Text className="text-[#582308] font-semibold">Acción Terciaria</Text>
</TouchableOpacity>
```

### Cards

```tsx
<View className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border-l-4 border-[#582308]">
  <Text className="text-gray-900 dark:text-white font-bold text-lg">
    Título del Card
  </Text>
  <Text className="text-gray-600 dark:text-gray-400 mt-2">
    Contenido del card
  </Text>
</View>
```

### Badges

```tsx
// Badge de notificación
<View className="bg-[#582308] rounded-full w-6 h-6 items-center justify-center">
  <Text className="text-white text-xs font-bold">5</Text>
</View>

// Badge de estado
<View className="bg-[#D4A574] rounded-full px-3 py-1">
  <Text className="text-white text-xs font-semibold">Activo</Text>
</View>
```

### Avatares

```tsx
// Avatar con inicial
<View className="w-12 h-12 rounded-full bg-[#582308] items-center justify-center">
  <Text className="text-white text-lg font-bold">J</Text>
</View>

// Avatar con borde
<View className="w-12 h-12 rounded-full border-2 border-[#D4A574]">
  <Image source={{ uri: avatarUrl }} className="w-full h-full rounded-full" />
</View>
```

### Inputs

```tsx
<TextInput
  className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 text-gray-900 dark:text-white border-2 border-transparent focus:border-[#582308]"
  placeholder="Escribe aquí..."
  placeholderTextColor="#9CA3AF"
/>
```

### Headers

```tsx
<View className="bg-[#582308] py-4 px-6">
  <Text className="text-white text-xl font-bold">Trimly</Text>
  <Text className="text-[#D4A574] text-sm">Tu barbería en un toque</Text>
</View>
```

---

## 🌓 Modo Oscuro

En modo oscuro, los colores se ajustan automáticamente:

```tsx
// Texto adaptativo
<Text className="text-gray-900 dark:text-white">
  Texto que se adapta al tema
</Text>

// Fondo adaptativo
<View className="bg-white dark:bg-gray-800">
  {/* Contenido */}
</View>

// Borde adaptativo
<View className="border border-gray-200 dark:border-gray-700">
  {/* Contenido */}
</View>
```

---

## 📱 Ejemplos por Pantalla

### Pantalla de Login

```tsx
<View className="flex-1 bg-white dark:bg-gray-900">
  {/* Logo */}
  <View className="items-center mt-20">
    <View className="w-24 h-24 rounded-full bg-[#582308] items-center justify-center">
      <Text className="text-white text-4xl">✂️</Text>
    </View>
    <Text className="text-[#582308] text-3xl font-bold mt-4">Trimly</Text>
    <Text className="text-[#D4A574] text-base">Tu barbería en un toque</Text>
  </View>

  {/* Inputs */}
  <View className="px-6 mt-10">
    <TextInput
      className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 mb-4"
      placeholder="Email"
    />
    <TextInput
      className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-3 mb-6"
      placeholder="Contraseña"
      secureTextEntry
    />
    
    {/* Botón */}
    <TouchableOpacity className="bg-[#582308] py-4 rounded-lg">
      <Text className="text-white text-center font-semibold text-lg">
        Iniciar Sesión
      </Text>
    </TouchableOpacity>
  </View>
</View>
```

### Card de Barbería

```tsx
<TouchableOpacity className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-4 shadow-md">
  {/* Imagen */}
  <Image 
    source={{ uri: barbershop.image }} 
    className="w-full h-40 rounded-lg mb-3"
  />
  
  {/* Info */}
  <View className="flex-row items-center justify-between mb-2">
    <Text className="text-gray-900 dark:text-white font-bold text-lg">
      {barbershop.name}
    </Text>
    <View className="flex-row items-center">
      <Text className="text-[#D4A574] mr-1">⭐</Text>
      <Text className="text-gray-900 dark:text-white font-semibold">
        {barbershop.rating}
      </Text>
    </View>
  </View>
  
  {/* Ubicación */}
  <View className="flex-row items-center mb-3">
    <Text className="text-[#582308] mr-2">📍</Text>
    <Text className="text-gray-600 dark:text-gray-400 flex-1">
      {barbershop.address}
    </Text>
  </View>
  
  {/* Botón */}
  <TouchableOpacity className="bg-[#582308] py-2 rounded-lg">
    <Text className="text-white text-center font-semibold">
      Ver Detalles
    </Text>
  </TouchableOpacity>
</TouchableOpacity>
```

### Perfil de Barbero

```tsx
<View className="bg-white dark:bg-gray-900 flex-1">
  {/* Header con gradiente simulado */}
  <View className="bg-[#582308] pt-12 pb-20 px-6">
    <Text className="text-white text-2xl font-bold">Perfil del Barbero</Text>
  </View>
  
  {/* Avatar flotante */}
  <View className="items-center -mt-16">
    <View className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-900 bg-[#D4A574] items-center justify-center">
      <Image 
        source={{ uri: barber.avatar }} 
        className="w-full h-full rounded-full"
      />
    </View>
    <Text className="text-gray-900 dark:text-white text-xl font-bold mt-3">
      {barber.name}
    </Text>
    <Text className="text-[#582308] text-sm">
      ⭐ {barber.rating} • {barber.reviews} reseñas
    </Text>
  </View>
  
  {/* Botones de acción */}
  <View className="flex-row px-6 mt-6 gap-3">
    <TouchableOpacity className="flex-1 bg-[#582308] py-3 rounded-lg">
      <Text className="text-white text-center font-semibold">Reservar</Text>
    </TouchableOpacity>
    <TouchableOpacity className="flex-1 bg-[#D4A574] py-3 rounded-lg">
      <Text className="text-white text-center font-semibold">Mensaje</Text>
    </TouchableOpacity>
  </View>
</View>
```

---

## 🎨 Combinaciones Recomendadas

### Elegante y Profesional
```
Fondo: #FFFFFF
Primario: #582308
Secundario: #D4A574
Texto: #111827
```

### Cálido y Acogedor
```
Fondo: #F9FAFB
Primario: #7A3010
Secundario: #E5C9A3
Texto: #374151
```

### Moderno y Minimalista
```
Fondo: #FFFFFF
Primario: #582308
Acento: #C19A6B
Texto: #0F172A
```

---

## 🚫 Qué NO Hacer

❌ No uses azul (#3B82F6) - Ya no es parte del tema
❌ No mezcles demasiados colores en un mismo componente
❌ No uses el marrón para textos pequeños (baja legibilidad)
❌ No olvides el contraste en modo oscuro
❌ No uses colores brillantes que choquen con el tema

---

## ✅ Mejores Prácticas

✅ Usa el marrón (#582308) para acciones principales
✅ Usa el dorado (#D4A574) para elementos premium
✅ Mantén consistencia en toda la app
✅ Prueba en modo claro y oscuro
✅ Usa grises para texto secundario
✅ Agrega sombras sutiles para profundidad

---

## 🔧 Configuración en Tailwind

Si usas `tailwind.config.js`, agrega estos colores:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        barbershop: {
          50: '#F5F3F0',
          100: '#E5DED6',
          200: '#D4C9BD',
          300: '#C19A6B',
          400: '#B8894F',
          500: '#582308', // Principal
          600: '#3D1806',
          700: '#2D1104',
          800: '#1D0B03',
          900: '#0D0501',
        },
        gold: {
          50: '#FAF8F5',
          100: '#F0EBE3',
          200: '#E5C9A3',
          300: '#D4A574', // Secundario
          400: '#B8894F',
          500: '#A67C52',
          600: '#8F6B45',
          700: '#785A38',
          800: '#61492B',
          900: '#4A381E',
        },
      },
    },
  },
};
```

---

## 📊 Accesibilidad

### Contraste de Colores

✅ **Aprobado WCAG AA:**
- Marrón (#582308) sobre blanco
- Blanco sobre marrón (#582308)
- Dorado (#D4A574) sobre marrón oscuro (#3D1806)

⚠️ **Usar con precaución:**
- Dorado (#D4A574) sobre blanco (bajo contraste)
- Marrón claro (#7A3010) sobre blanco

### Recomendaciones

1. Usa texto blanco sobre fondos marrones
2. Usa texto marrón oscuro sobre fondos claros
3. Agrega bordes para mejorar la visibilidad
4. Prueba con herramientas de contraste

---

## 🎯 Resumen Rápido

**Color Principal:** `#582308` (Marrón barbería)
**Color Secundario:** `#D4A574` (Dorado/Beige)
**Color de Acento:** `#C19A6B` (Camel)

**Uso en código:**
```tsx
className="bg-[#582308]"  // Fondo marrón
className="text-[#582308]" // Texto marrón
className="border-[#582308]" // Borde marrón
```

---

**¡Tu app ahora tiene el look perfecto de una barbería clásica!** ✂️
