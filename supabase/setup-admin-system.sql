-- =====================================================
-- PASO 1: Agregar roles de administrador
-- =====================================================

-- Modificar el CHECK constraint para incluir admin y super_admin
ALTER TABLE public.usuarios 
DROP CONSTRAINT IF EXISTS usuarios_rol_check;

ALTER TABLE public.usuarios 
ADD CONSTRAINT usuarios_rol_check 
CHECK (rol = ANY (ARRAY['barbero'::text, 'cliente'::text, 'admin'::text, 'super_admin'::text]));

-- =====================================================
-- PASO 2: Crear funciones de gestión de usuarios
-- =====================================================

-- Función para crear super admin (solo desde SQL)
CREATE OR REPLACE FUNCTION public.create_super_admin(
  admin_email text,
  admin_nombre text,
  admin_telefono text
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  result json;
BEGIN
  -- Buscar el usuario en auth.users por email
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF new_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado en auth.users. Primero crea el usuario en Authentication.';
  END IF;
  
  -- Insertar o actualizar en la tabla usuarios
  INSERT INTO public.usuarios (
    id, email, nombre, telefono, rol, negocio_id, avatar, 
    especialidad, horario_inicio, horario_fin, activo
  ) VALUES (
    new_user_id, admin_email, admin_nombre, admin_telefono, 
    'super_admin', NULL, NULL, NULL, NULL, NULL, true
  )
  ON CONFLICT (id) 
  DO UPDATE SET
    rol = 'super_admin',
    nombre = admin_nombre,
    telefono = admin_telefono,
    updated_at = now();
  
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', admin_email,
    'rol', 'super_admin'
  );
  
  RETURN result;
END;
$$;

-- Función para que super_admin cree admins de locales
CREATE OR REPLACE FUNCTION public.create_local_admin(
  admin_email text,
  admin_nombre text,
  admin_telefono text,
  local_negocio_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  caller_role text;
  result json;
BEGIN
  -- Verificar que quien llama es super_admin
  SELECT rol INTO caller_role
  FROM public.usuarios
  WHERE id = auth.uid();
  
  IF caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Solo super_admin puede crear administradores de locales';
  END IF;
  
  -- Buscar el usuario en auth.users por email
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = admin_email;
  
  IF new_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado. Primero debe registrarse en la aplicación.';
  END IF;
  
  -- Actualizar el usuario a admin
  UPDATE public.usuarios
  SET 
    rol = 'admin',
    negocio_id = local_negocio_id,
    nombre = admin_nombre,
    telefono = admin_telefono,
    updated_at = now()
  WHERE id = new_user_id;
  
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', admin_email,
    'rol', 'admin',
    'negocio_id', local_negocio_id
  );
  
  RETURN result;
END;
$$;

-- Función para que admin cree barberos
CREATE OR REPLACE FUNCTION public.create_barber(
  barber_email text,
  barber_nombre text,
  barber_telefono text,
  barber_especialidad text DEFAULT NULL,
  barber_horario_inicio text DEFAULT NULL,
  barber_horario_fin text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_user_id uuid;
  caller_role text;
  caller_negocio_id uuid;
  result json;
BEGIN
  -- Verificar que quien llama es admin o super_admin
  SELECT rol, negocio_id INTO caller_role, caller_negocio_id
  FROM public.usuarios
  WHERE id = auth.uid();
  
  IF caller_role NOT IN ('admin', 'super_admin') THEN
    RAISE EXCEPTION 'Solo admin o super_admin pueden crear barberos';
  END IF;
  
  -- Si es admin, debe tener un negocio asignado
  IF caller_role = 'admin' AND caller_negocio_id IS NULL THEN
    RAISE EXCEPTION 'Admin debe estar asignado a un negocio';
  END IF;
  
  -- Buscar el usuario en auth.users por email
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = barber_email;
  
  IF new_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado. Primero debe registrarse en la aplicación.';
  END IF;
  
  -- Actualizar el usuario a barbero
  UPDATE public.usuarios
  SET 
    rol = 'barbero',
    negocio_id = caller_negocio_id,
    nombre = barber_nombre,
    telefono = barber_telefono,
    especialidad = barber_especialidad,
    horario_inicio = barber_horario_inicio,
    horario_fin = barber_horario_fin,
    updated_at = now()
  WHERE id = new_user_id;
  
  result := json_build_object(
    'success', true,
    'user_id', new_user_id,
    'email', barber_email,
    'rol', 'barbero',
    'negocio_id', caller_negocio_id
  );
  
  RETURN result;
END;
$$;

-- Otorgar permisos
GRANT EXECUTE ON FUNCTION public.create_super_admin(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_local_admin(text, text, text, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_barber(text, text, text, text, text, text) TO authenticated;

-- =====================================================
-- PASO 3: Actualizar políticas RLS
-- =====================================================

-- Super admin puede ver todos los usuarios
DROP POLICY IF EXISTS "usuarios_select_super_admin" ON public.usuarios;
CREATE POLICY "usuarios_select_super_admin"
ON public.usuarios FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'super_admin'
  )
);

-- Admin puede ver usuarios de su negocio
DROP POLICY IF EXISTS "usuarios_select_admin_negocio" ON public.usuarios;
CREATE POLICY "usuarios_select_admin_negocio"
ON public.usuarios FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = auth.uid() AND u.rol = 'admin'
    AND u.negocio_id = usuarios.negocio_id
  )
);

-- Super admin puede actualizar cualquier usuario
DROP POLICY IF EXISTS "usuarios_update_super_admin" ON public.usuarios;
CREATE POLICY "usuarios_update_super_admin"
ON public.usuarios FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'super_admin'
  )
);

-- Admin puede actualizar usuarios de su negocio
DROP POLICY IF EXISTS "usuarios_update_admin_negocio" ON public.usuarios;
CREATE POLICY "usuarios_update_admin_negocio"
ON public.usuarios FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios u
    WHERE u.id = auth.uid() AND u.rol = 'admin'
    AND u.negocio_id = usuarios.negocio_id
  )
);

-- Super admin tiene acceso total a negocios
DROP POLICY IF EXISTS "negocios_all_super_admin" ON public.negocios;
CREATE POLICY "negocios_all_super_admin"
ON public.negocios FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'super_admin'
  )
);

-- Admin puede ver y modificar su negocio
DROP POLICY IF EXISTS "negocios_select_admin" ON public.negocios;
CREATE POLICY "negocios_select_admin"
ON public.negocios FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'admin'
    AND negocio_id = negocios.id
  )
);

DROP POLICY IF EXISTS "negocios_update_admin" ON public.negocios;
CREATE POLICY "negocios_update_admin"
ON public.negocios FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid() AND rol = 'admin'
    AND negocio_id = negocios.id
  )
);

-- Mensaje de éxito
DO $$
BEGIN
  RAISE NOTICE 'Sistema de administración configurado exitosamente';
  RAISE NOTICE 'Ahora puedes crear tu usuario super admin';
END $$;
