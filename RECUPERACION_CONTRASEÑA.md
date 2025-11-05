# 🔐 Recuperación de Contraseña

## 📱 Para Usuarios

1. En la pantalla de login, haz clic en **"¿Olvidaste tu contraseña?"**
2. Ingresa tu email
3. Haz clic en **"Enviar Email de Recuperación"**
4. Revisa tu correo (incluyendo spam)
5. Haz clic en el enlace del email
6. Se abrirá una página web
7. Ingresa tu nueva contraseña
8. Inicia sesión en la app con la nueva contraseña

## ⚙️ Configuración (Solo una vez)

### 1. Subir página a Vercel

```bash
cd public
vercel --prod
```

Copia la URL que te da Vercel (ej: `https://tu-proyecto.vercel.app`)

### 2. Configurar Supabase

1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. **Authentication** → **URL Configuration**
4. En **"Redirect URLs"** agrega:
   ```
   https://tu-proyecto.vercel.app/
   https://tu-proyecto.vercel.app/index.html
   ```
5. Haz clic en **"Save"**

### 3. Actualizar código (Ya está hecho)

El código ya está configurado en `src/screens/auth/ForgotPasswordScreen.tsx`

## 🔧 Para Administradores

### Cambiar contraseña manualmente

1. Ve a Supabase Dashboard
2. **Authentication** → **Users**
3. Busca el usuario
4. Haz clic en el usuario
5. Cambia el campo **"Password"**
6. Haz clic en **"Update User"**

## 🚨 Solución de Problemas

### El email no llega
- Espera 5 minutos
- Revisa spam
- Verifica que el email esté registrado

### El enlace no funciona
- Los enlaces expiran en 1 hora
- Solicita un nuevo enlace
- Verifica que la URL esté configurada en Supabase

### Error al cambiar contraseña
- Verifica tu conexión a internet
- La contraseña debe tener mínimo 6 caracteres
- Solicita un nuevo enlace

---

**Página web**: `public/index.html`  
**URL actual**: `https://proyecto-barber-paginas.vercel.app/`
