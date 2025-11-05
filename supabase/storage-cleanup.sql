-- =====================================================
-- Storage Policies Cleanup
-- Ejecuta este script si necesitas eliminar políticas
-- existentes antes de recrearlas
-- =====================================================

-- Eliminar políticas del bucket: avatars
DROP POLICY IF EXISTS "usuarios_upload_own_avatar" ON storage.objects;
DROP POLICY IF EXISTS "usuarios_update_own_avatar" ON storage.objects;
DROP POLICY IF EXISTS "usuarios_delete_own_avatar" ON storage.objects;
DROP POLICY IF EXISTS "avatars_public_read" ON storage.objects;

-- Eliminar políticas del bucket: negocio-logos
DROP POLICY IF EXISTS "barberos_upload_negocio_logo" ON storage.objects;
DROP POLICY IF EXISTS "barberos_update_negocio_logo" ON storage.objects;
DROP POLICY IF EXISTS "barberos_delete_negocio_logo" ON storage.objects;
DROP POLICY IF EXISTS "negocio_logos_public_read" ON storage.objects;

-- Eliminar políticas del bucket: shorts-videos
DROP POLICY IF EXISTS "barberos_upload_shorts" ON storage.objects;
DROP POLICY IF EXISTS "barberos_update_shorts" ON storage.objects;
DROP POLICY IF EXISTS "barberos_delete_shorts" ON storage.objects;
DROP POLICY IF EXISTS "shorts_videos_public_read" ON storage.objects;

-- Eliminar políticas del bucket: shorts-thumbnails
DROP POLICY IF EXISTS "barberos_upload_thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "barberos_update_thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "barberos_delete_thumbnails" ON storage.objects;
DROP POLICY IF EXISTS "shorts_thumbnails_public_read" ON storage.objects;

-- Verificar que se eliminaron
SELECT 
  policyname,
  tablename
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;

-- Si no hay resultados, todas las políticas fueron eliminadas correctamente
