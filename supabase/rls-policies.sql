-- =====================================================
-- Row Level Security (RLS) Policies
-- Para la aplicación de gestión de barberías
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negocios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fila ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shorts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA TABLA: usuarios
-- =====================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "usuarios_select_own"
ON public.usuarios
FOR SELECT
USING (auth.uid() = id);

-- Los usuarios pueden ver perfiles de barberos (para buscar y reservar)
CREATE POLICY "usuarios_select_barberos"
ON public.usuarios
FOR SELECT
USING (rol = 'barbero' AND activo = true);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "usuarios_update_own"
ON public.usuarios
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil (durante registro)
CREATE POLICY "usuarios_insert_own"
ON public.usuarios
FOR INSERT
WITH CHECK (auth.uid() = id);

-- =====================================================
-- POLÍTICAS PARA TABLA: negocios
-- =====================================================

-- Todos pueden ver negocios activos (para buscar barberías)
CREATE POLICY "negocios_select_all"
ON public.negocios
FOR SELECT
USING (true);

-- Solo usuarios autenticados pueden crear negocios (para futuras funcionalidades)
CREATE POLICY "negocios_insert_authenticated"
ON public.negocios
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Los barberos pueden actualizar su propio negocio
CREATE POLICY "negocios_update_own"
ON public.negocios
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = negocios.id
    AND usuarios.rol = 'barbero'
  )
);

-- =====================================================
-- POLÍTICAS PARA TABLA: servicios
-- =====================================================

-- Todos pueden ver servicios activos
CREATE POLICY "servicios_select_active"
ON public.servicios
FOR SELECT
USING (activo = true);

-- Los barberos pueden crear servicios para su negocio
CREATE POLICY "servicios_insert_own_negocio"
ON public.servicios
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = servicios.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- Los barberos pueden actualizar servicios de su negocio
CREATE POLICY "servicios_update_own_negocio"
ON public.servicios
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = servicios.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- Los barberos pueden eliminar servicios de su negocio
CREATE POLICY "servicios_delete_own_negocio"
ON public.servicios
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = servicios.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- =====================================================
-- POLÍTICAS PARA TABLA: citas
-- =====================================================

-- Los clientes pueden ver sus propias citas
CREATE POLICY "citas_select_own_cliente"
ON public.citas
FOR SELECT
USING (auth.uid() = cliente_id);

-- Los barberos pueden ver citas de su negocio
CREATE POLICY "citas_select_own_negocio"
ON public.citas
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = citas.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- Los clientes pueden crear citas
CREATE POLICY "citas_insert_cliente"
ON public.citas
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = cliente_id);

-- Los clientes pueden actualizar sus propias citas (cancelar, agregar notas)
CREATE POLICY "citas_update_own_cliente"
ON public.citas
FOR UPDATE
USING (auth.uid() = cliente_id)
WITH CHECK (auth.uid() = cliente_id);

-- Los barberos pueden actualizar citas de su negocio (cambiar estado, confirmar)
CREATE POLICY "citas_update_own_negocio"
ON public.citas
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = citas.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- Los barberos pueden eliminar citas de su negocio
CREATE POLICY "citas_delete_own_negocio"
ON public.citas
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = citas.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- =====================================================
-- POLÍTICAS PARA TABLA: fila
-- =====================================================

-- Los clientes pueden ver su propia posición en la fila
CREATE POLICY "fila_select_own_cliente"
ON public.fila
FOR SELECT
USING (auth.uid() = cliente_id);

-- Los barberos pueden ver la fila de su negocio
CREATE POLICY "fila_select_own_negocio"
ON public.fila
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = fila.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- Los clientes pueden unirse a la fila
CREATE POLICY "fila_insert_cliente"
ON public.fila
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = cliente_id);

-- Los clientes pueden actualizar su entrada en la fila (cancelar)
CREATE POLICY "fila_update_own_cliente"
ON public.fila
FOR UPDATE
USING (auth.uid() = cliente_id)
WITH CHECK (auth.uid() = cliente_id);

-- Los barberos pueden actualizar la fila de su negocio (cambiar estado, atender)
CREATE POLICY "fila_update_own_negocio"
ON public.fila
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = fila.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- Los barberos pueden eliminar entradas de la fila de su negocio
CREATE POLICY "fila_delete_own_negocio"
ON public.fila
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = fila.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- =====================================================
-- POLÍTICAS PARA TABLA: shorts
-- =====================================================

-- Todos pueden ver shorts activos
CREATE POLICY "shorts_select_active"
ON public.shorts
FOR SELECT
USING (activo = true);

-- Los barberos pueden crear shorts para su negocio
CREATE POLICY "shorts_insert_own_negocio"
ON public.shorts
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = shorts.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- Los barberos pueden actualizar shorts de su negocio
CREATE POLICY "shorts_update_own_negocio"
ON public.shorts
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = shorts.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- Los barberos pueden eliminar shorts de su negocio
CREATE POLICY "shorts_delete_own_negocio"
ON public.shorts
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.negocio_id = shorts.negocio_id
    AND usuarios.rol = 'barbero'
  )
);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para verificar si un usuario es barbero de un negocio específico
CREATE OR REPLACE FUNCTION public.is_barbero_of_negocio(negocio_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE id = auth.uid()
    AND negocio_id = negocio_uuid
    AND rol = 'barbero'
    AND activo = true
  );
END;
$$;

-- Función para obtener el negocio_id del usuario actual
CREATE OR REPLACE FUNCTION public.get_user_negocio_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  negocio_uuid uuid;
BEGIN
  SELECT negocio_id INTO negocio_uuid
  FROM public.usuarios
  WHERE id = auth.uid();
  
  RETURN negocio_uuid;
END;
$$;

-- =====================================================
-- TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Trigger para usuarios
DROP TRIGGER IF EXISTS usuarios_updated_at ON public.usuarios;
CREATE TRIGGER usuarios_updated_at
  BEFORE UPDATE ON public.usuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para negocios
DROP TRIGGER IF EXISTS negocios_updated_at ON public.negocios;
CREATE TRIGGER negocios_updated_at
  BEFORE UPDATE ON public.negocios
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para citas
DROP TRIGGER IF EXISTS citas_updated_at ON public.citas;
CREATE TRIGGER citas_updated_at
  BEFORE UPDATE ON public.citas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- =====================================================

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_negocio_id ON public.usuarios(negocio_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);

CREATE INDEX IF NOT EXISTS idx_citas_cliente_id ON public.citas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_citas_barbero_id ON public.citas(barbero_id);
CREATE INDEX IF NOT EXISTS idx_citas_negocio_id ON public.citas(negocio_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON public.citas(fecha);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON public.citas(estado);

CREATE INDEX IF NOT EXISTS idx_fila_negocio_id ON public.fila(negocio_id);
CREATE INDEX IF NOT EXISTS idx_fila_cliente_id ON public.fila(cliente_id);
CREATE INDEX IF NOT EXISTS idx_fila_estado ON public.fila(estado);

CREATE INDEX IF NOT EXISTS idx_servicios_negocio_id ON public.servicios(negocio_id);
CREATE INDEX IF NOT EXISTS idx_shorts_negocio_id ON public.shorts(negocio_id);

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON POLICY "usuarios_select_own" ON public.usuarios IS 'Los usuarios pueden ver su propio perfil';
COMMENT ON POLICY "usuarios_select_barberos" ON public.usuarios IS 'Todos pueden ver perfiles de barberos activos';
COMMENT ON POLICY "citas_select_own_cliente" ON public.citas IS 'Los clientes pueden ver sus propias citas';
COMMENT ON POLICY "citas_select_own_negocio" ON public.citas IS 'Los barberos pueden ver citas de su negocio';
