-- =====================================================
-- AVATARS STORAGE MIGRATION
-- Sistema de almacenamiento de fotos de perfil
-- =====================================================

-- Crear bucket para avatares si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- =====================================================
-- POLÍTICAS DE STORAGE
-- =====================================================

-- Permitir a los usuarios subir su propio avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir a todos ver los avatares (público)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Permitir a los usuarios actualizar su propio avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir a los usuarios eliminar su propio avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =====================================================
-- VERIFICAR QUE LA COLUMNA avatar_url EXISTE
-- =====================================================

-- La columna avatar_url ya debería existir en la tabla users
-- Si no existe, agregarla:
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url TEXT;
  END IF;
END $$;

-- =====================================================
-- FUNCIÓN PARA LIMPIAR AVATARES ANTIGUOS
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_old_avatar()
RETURNS TRIGGER AS $$
BEGIN
  -- Si el avatar_url cambió y el anterior no era nulo
  IF OLD.avatar_url IS NOT NULL AND 
     NEW.avatar_url IS DISTINCT FROM OLD.avatar_url THEN
    
    -- Aquí podrías agregar lógica para eliminar el archivo antiguo
    -- Por ahora solo lo registramos
    RAISE NOTICE 'Avatar changed for user %: % -> %', 
      NEW.id, OLD.avatar_url, NEW.avatar_url;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para limpiar avatares antiguos (opcional)
DROP TRIGGER IF EXISTS trigger_cleanup_old_avatar ON users;
CREATE TRIGGER trigger_cleanup_old_avatar
  AFTER UPDATE OF avatar_url ON users
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_old_avatar();

-- =====================================================
-- COMENTARIOS
-- =====================================================

COMMENT ON COLUMN users.avatar_url IS 'URL pública de la foto de perfil del usuario';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verificar que el bucket existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'avatars') THEN
    RAISE EXCEPTION 'Bucket avatars no fue creado correctamente';
  END IF;
  
  RAISE NOTICE 'Bucket avatars creado exitosamente';
END $$;
