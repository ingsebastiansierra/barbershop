-- Crear trigger para actualizar contador de likes automáticamente

-- 1. Crear función para actualizar el contador de likes
CREATE OR REPLACE FUNCTION update_short_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.barber_shorts
    SET likes_count = likes_count + 1
    WHERE id = NEW.short_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.barber_shorts
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.short_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 2. Eliminar trigger si existe
DROP TRIGGER IF EXISTS trigger_update_short_likes_count ON public.shorts_likes;

-- 3. Crear trigger para likes
CREATE TRIGGER trigger_update_short_likes_count
AFTER INSERT OR DELETE ON public.shorts_likes
FOR EACH ROW
EXECUTE FUNCTION update_short_likes_count();

-- 4. Actualizar contadores actuales basándose en datos reales
UPDATE public.barber_shorts
SET likes_count = (
  SELECT COUNT(*)
  FROM public.shorts_likes
  WHERE short_id = barber_shorts.id
);

UPDATE public.barber_shorts
SET comments_count = (
  SELECT COUNT(*)
  FROM public.shorts_comments
  WHERE short_id = barber_shorts.id
);

-- 5. Verificar que todo está correcto
SELECT 
  bs.id,
  bs.title,
  bs.likes_count,
  (SELECT COUNT(*) FROM public.shorts_likes WHERE short_id = bs.id) as likes_reales,
  bs.comments_count,
  (SELECT COUNT(*) FROM public.shorts_comments WHERE short_id = bs.id) as comentarios_reales,
  CASE 
    WHEN bs.likes_count = (SELECT COUNT(*) FROM public.shorts_likes WHERE short_id = bs.id) 
    THEN '✓ OK' 
    ELSE '✗ ERROR' 
  END as likes_status,
  CASE 
    WHEN bs.comments_count = (SELECT COUNT(*) FROM public.shorts_comments WHERE short_id = bs.id) 
    THEN '✓ OK' 
    ELSE '✗ ERROR' 
  END as comments_status
FROM public.barber_shorts bs
ORDER BY bs.created_at DESC;
