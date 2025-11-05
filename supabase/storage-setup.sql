-- =====================================================
-- Storage Buckets Configuration
-- Para la aplicación de gestión de barberías
-- =====================================================

-- IMPORTANTE: Primero debes crear los buckets desde la UI de Supabase
-- Luego ejecuta este script para aplicar las políticas

-- =====================================================
-- BUCKET: avatars
-- =====================================================
-- Configuración del bucket (crear desde UI):
-- - Nombre: avatars
-- - Public: true (para que las URLs sean accesibles públicamente)
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

-- Política: Los usuarios pueden subir su propio avatar
CREATE POLICY "usuarios_upload_own_avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Los usuarios pueden actualizar su propio avatar
CREATE POLICY "usuarios_update_own_avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Los usuarios pueden eliminar su propio avatar
CREATE POLICY "usuarios_delete_own_avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política: Todos pueden ver avatares (lectura pública)
CREATE POLICY "avatars_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- =====================================================
-- BUCKET: negocio-logos
-- =====================================================
-- Configuración del bucket (crear desde UI):
-- - Nombre: negocio-logos
-- - Public: true
-- - File size limit: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp

-- Política: Los barberos pueden subir logos para su negocio
CREATE POLICY "barberos_upload_negocio_logo"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'negocio-logos'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
);

-- Política: Los barberos pueden actualizar logos de su negocio
CREATE POLICY "barberos_update_negocio_logo"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'negocio-logos'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
)
WITH CHECK (
  bucket_id = 'negocio-logos'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
);

-- Política: Los barberos pueden eliminar logos de su negocio
CREATE POLICY "barberos_delete_negocio_logo"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'negocio-logos'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
);

-- Política: Todos pueden ver logos de negocios (lectura pública)
CREATE POLICY "negocio_logos_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'negocio-logos');

-- =====================================================
-- BUCKET: shorts-videos
-- =====================================================
-- Configuración del bucket (crear desde UI):
-- - Nombre: shorts-videos
-- - Public: true
-- - File size limit: 50MB
-- - Allowed MIME types: video/mp4, video/quicktime, video/webm

-- Política: Los barberos pueden subir videos para su negocio
CREATE POLICY "barberos_upload_shorts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shorts-videos'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
);

-- Política: Los barberos pueden actualizar videos de su negocio
CREATE POLICY "barberos_update_shorts"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shorts-videos'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
)
WITH CHECK (
  bucket_id = 'shorts-videos'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
);

-- Política: Los barberos pueden eliminar videos de su negocio
CREATE POLICY "barberos_delete_shorts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'shorts-videos'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
);

-- Política: Todos pueden ver videos (lectura pública)
CREATE POLICY "shorts_videos_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'shorts-videos');

-- =====================================================
-- BUCKET: shorts-thumbnails
-- =====================================================
-- Configuración del bucket (crear desde UI):
-- - Nombre: shorts-thumbnails
-- - Public: true
-- - File size limit: 2MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp

-- Política: Los barberos pueden subir thumbnails para su negocio
CREATE POLICY "barberos_upload_thumbnails"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'shorts-thumbnails'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
);

-- Política: Los barberos pueden actualizar thumbnails de su negocio
CREATE POLICY "barberos_update_thumbnails"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'shorts-thumbnails'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
)
WITH CHECK (
  bucket_id = 'shorts-thumbnails'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
);

-- Política: Los barberos pueden eliminar thumbnails de su negocio
CREATE POLICY "barberos_delete_thumbnails"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'shorts-thumbnails'
  AND EXISTS (
    SELECT 1 FROM public.usuarios
    WHERE usuarios.id = auth.uid()
    AND usuarios.rol = 'barbero'
    AND usuarios.negocio_id::text = (storage.foldername(name))[1]
  )
);

-- Política: Todos pueden ver thumbnails (lectura pública)
CREATE POLICY "shorts_thumbnails_public_read"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'shorts-thumbnails');

-- =====================================================
-- VERIFICACIÓN
-- =====================================================

-- Verifica que las políticas se hayan creado correctamente
SELECT 
  policyname,
  tablename,
  cmd
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;
