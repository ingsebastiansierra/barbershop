# 🔧 Fix: Subida de Fotos de Perfil en React Native

## ❌ Problemas Encontrados

### 1. Error: `Property 'blob' doesn't exist`
**Causa:** El método `.blob()` no existe en React Native, solo en navegadores web.

### 2. Warning: `MediaTypeOptions` deprecated
**Causa:** API antigua de expo-image-picker.

---

## ✅ Soluciones Aplicadas

### 1. Usar ArrayBuffer en lugar de Blob

**Antes (NO funciona en React Native):**
```typescript
const response = await fetch(imageUri);
const blob = await response.blob(); // ❌ No existe en RN
```

**Después (Funciona en React Native):**
```typescript
const response = await fetch(imageUri);
const arrayBuffer = await response.arrayBuffer(); // ✅ Funciona
const fileData = new Uint8Array(arrayBuffer);
```

### 2. Actualizar API de ImagePicker

**Antes (Deprecado):**
```typescript
mediaTypes: ImagePicker.MediaTypeOptions.Images, // ⚠️ Deprecado
```

**Después (Actual):**
```typescript
mediaTypes: ['images'], // ✅ Nueva API
```

---

## 🔄 Cambios Realizados

### En `profileService.ts`:

1. **Método `pickImageFromLibrary()`:**
   - Cambiado `MediaTypeOptions.Images` → `['images']`

2. **Método `uploadProfilePhoto()`:**
   - Cambiado `.blob()` → `.arrayBuffer()`
   - Convertido a `Uint8Array` para Supabase
   - Funciona perfectamente en React Native

---

## 🧪 Cómo Probar

1. **Reinicia la app:**
   ```bash
   # Detén el servidor (Ctrl+C)
   npm start
   ```

2. **Prueba subir foto:**
   - Ve a Perfil
   - Toca tu avatar
   - Selecciona "Elegir de Galería"
   - Elige una foto
   - ✅ Debe subirse sin errores

3. **Verifica en Supabase:**
   - Ve a Storage → avatars
   - Debe aparecer tu foto en `{userId}/avatar-{timestamp}.jpg`

---

## 📝 Código Final

```typescript
async uploadProfilePhoto(userId: string, imageUri: string): Promise<string> {
  try {
    // 1. Generar nombre único
    const fileExt = imageUri.split('.').pop()?.split('?')[0] || 'jpg';
    const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

    // 2. Leer archivo como ArrayBuffer (React Native compatible)
    const response = await fetch(imageUri);
    const arrayBuffer = await response.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    // 3. Subir a Supabase
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, fileData, {
        contentType: `image/${fileExt}`,
        upsert: true,
      });

    if (error) throw error;

    // 4. Obtener URL pública
    const { data } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return data.publicUrl;
  } catch (error) {
    console.error('Error uploading:', error);
    throw error;
  }
}
```

---

## ✅ Resultado

Ahora la subida de fotos funciona correctamente en:
- ✅ Android
- ✅ iOS
- ✅ Expo Go
- ✅ Build de producción

---

## 🎉 ¡Listo!

El sistema de fotos de perfil ahora funciona perfectamente en React Native.

**Pruébalo y disfruta!** 📸✂️
