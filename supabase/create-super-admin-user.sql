-- =====================================================
-- Crear usuario Super Admin
-- Email: johannsebastian073@gmail.com
-- =====================================================

-- PASO 1: Primero debes crear el usuario en Supabase Authentication
-- Ve a: Authentication > Users > Add User
-- Email: johannsebastian073@gmail.com
-- Password: [tu contraseña segura]
-- Confirma el email automáticamente

-- PASO 2: Después de crear el usuario en Authentication, ejecuta este script:

-- Buscar el ID del usuario recién creado
DO $$
DECLARE
  user_id_found uuid;
BEGIN
  -- Buscar el usuario por email
  SELECT id INTO user_id_found
  FROM auth.users
  WHERE email = 'johannsebastian073@gmail.com';
  
  IF user_id_found IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado en auth.users. Primero créalo en Authentication > Users';
  END IF;
  
  -- Insertar o actualizar en la tabla usuarios como super_admin
  INSERT INTO public.usuarios (
    id,
    email,
    nombre,
    telefono,
    rol,
    negocio_id,
    avatar,
    especialidad,
    horario_inicio,
    horario_fin,
    activo
  ) VALUES (
    user_id_found,
    'johannsebastian073@gmail.com',
    'Johann Sebastian',
    '0000000000', -- Actualiza con tu teléfono real
    'super_admin',
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    true
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    rol = 'super_admin',
    nombre = 'Johann Sebastian',
    updated_at = now();
  
  RAISE NOTICE 'Super Admin creado exitosamente con ID: %', user_id_found;
END $$;

-- Verificar que se creó correctamente
SELECT 
  id,
  email,
  nombre,
  rol,
  activo,
  created_at
FROM public.usuarios
WHERE email = 'johannsebastian073@gmail.com';
