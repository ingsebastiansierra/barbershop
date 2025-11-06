-- Migration: Add Barber Shorts functionality
-- Description: Tables for barbers to upload short videos/images of their work (TikTok-style)

-- Create barber_shorts table
CREATE TABLE IF NOT EXISTS public.barber_shorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  
  -- Content
  media_type VARCHAR(10) NOT NULL CHECK (media_type IN ('video', 'image')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INTEGER, -- Duration in seconds (for videos, max 60)
  
  -- Metadata
  title VARCHAR(100),
  description TEXT,
  tags TEXT[], -- Array of tags like ['fade', 'corte', 'barba']
  
  -- Engagement
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_video_duration CHECK (
    media_type != 'video' OR (duration IS NOT NULL AND duration > 0 AND duration <= 60)
  )
);

-- Create shorts_likes table (for tracking who liked what)
CREATE TABLE IF NOT EXISTS public.shorts_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id UUID NOT NULL REFERENCES public.barber_shorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Unique constraint: one like per user per short
  CONSTRAINT unique_short_like UNIQUE (short_id, user_id)
);

-- Create shorts_views table (for tracking views)
CREATE TABLE IF NOT EXISTS public.shorts_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id UUID NOT NULL REFERENCES public.barber_shorts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Nullable for anonymous views
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Index for performance
  CONSTRAINT unique_short_view UNIQUE (short_id, user_id, viewed_at)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_barber_shorts_barber_id ON public.barber_shorts(barber_id);
CREATE INDEX IF NOT EXISTS idx_barber_shorts_barbershop_id ON public.barber_shorts(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barber_shorts_created_at ON public.barber_shorts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_barber_shorts_is_active ON public.barber_shorts(is_active);
CREATE INDEX IF NOT EXISTS idx_shorts_likes_short_id ON public.shorts_likes(short_id);
CREATE INDEX IF NOT EXISTS idx_shorts_likes_user_id ON public.shorts_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_shorts_views_short_id ON public.shorts_views(short_id);

-- Create function to update likes count
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

-- Create trigger for likes count
DROP TRIGGER IF EXISTS trigger_update_short_likes_count ON public.shorts_likes;
CREATE TRIGGER trigger_update_short_likes_count
AFTER INSERT OR DELETE ON public.shorts_likes
FOR EACH ROW
EXECUTE FUNCTION update_short_likes_count();

-- Create function to update views count
CREATE OR REPLACE FUNCTION update_short_views_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.barber_shorts
  SET views_count = views_count + 1
  WHERE id = NEW.short_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for views count
DROP TRIGGER IF EXISTS trigger_update_short_views_count ON public.shorts_views;
CREATE TRIGGER trigger_update_short_views_count
AFTER INSERT ON public.shorts_views
FOR EACH ROW
EXECUTE FUNCTION update_short_views_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_barber_shorts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_barber_shorts_updated_at ON public.barber_shorts;
CREATE TRIGGER trigger_update_barber_shorts_updated_at
BEFORE UPDATE ON public.barber_shorts
FOR EACH ROW
EXECUTE FUNCTION update_barber_shorts_updated_at();

-- Enable Row Level Security
ALTER TABLE public.barber_shorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shorts_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shorts_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for barber_shorts

-- Anyone can view active shorts
CREATE POLICY "Anyone can view active shorts"
ON public.barber_shorts FOR SELECT
USING (is_active = true);

-- Barbers can view their own shorts (including inactive)
CREATE POLICY "Barbers can view their own shorts"
ON public.barber_shorts FOR SELECT
USING (auth.uid() = barber_id);

-- Barbers can insert their own shorts
CREATE POLICY "Barbers can insert their own shorts"
ON public.barber_shorts FOR INSERT
WITH CHECK (auth.uid() = barber_id);

-- Barbers can update their own shorts
CREATE POLICY "Barbers can update their own shorts"
ON public.barber_shorts FOR UPDATE
USING (auth.uid() = barber_id);

-- Barbers can delete their own shorts
CREATE POLICY "Barbers can delete their own shorts"
ON public.barber_shorts FOR DELETE
USING (auth.uid() = barber_id);

-- RLS Policies for shorts_likes

-- Anyone can view likes
CREATE POLICY "Anyone can view likes"
ON public.shorts_likes FOR SELECT
USING (true);

-- Authenticated users can like shorts
CREATE POLICY "Authenticated users can like shorts"
ON public.shorts_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can unlike their own likes
CREATE POLICY "Users can unlike their own likes"
ON public.shorts_likes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for shorts_views

-- Anyone can view views (for analytics)
CREATE POLICY "Anyone can view views"
ON public.shorts_views FOR SELECT
USING (true);

-- Anyone can insert views
CREATE POLICY "Anyone can insert views"
ON public.shorts_views FOR INSERT
WITH CHECK (true);

-- Create storage bucket for shorts media
INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-shorts', 'barber-shorts', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for barber-shorts bucket

-- Anyone can view shorts media
CREATE POLICY "Anyone can view shorts media"
ON storage.objects FOR SELECT
USING (bucket_id = 'barber-shorts');

-- Barbers can upload their own shorts
CREATE POLICY "Barbers can upload their own shorts"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'barber-shorts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Barbers can update their own shorts
CREATE POLICY "Barbers can update their own shorts"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'barber-shorts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Barbers can delete their own shorts
CREATE POLICY "Barbers can delete their own shorts"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'barber-shorts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
