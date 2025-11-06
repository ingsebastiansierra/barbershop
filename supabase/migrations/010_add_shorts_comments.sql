-- Migration: Add Shorts Comments functionality
-- Description: Table for users to comment on shorts

-- Create shorts_comments table
CREATE TABLE IF NOT EXISTS public.shorts_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id UUID NOT NULL REFERENCES public.barber_shorts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Comment content
  comment TEXT NOT NULL CHECK (char_length(comment) > 0 AND char_length(comment) <= 500),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_shorts_comments_short_id ON public.shorts_comments(short_id);
CREATE INDEX IF NOT EXISTS idx_shorts_comments_user_id ON public.shorts_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_shorts_comments_created_at ON public.shorts_comments(created_at DESC);

-- Add comments_count to barber_shorts table
ALTER TABLE public.barber_shorts 
ADD COLUMN IF NOT EXISTS comments_count INTEGER DEFAULT 0;

-- Create function to update comments count
CREATE OR REPLACE FUNCTION update_short_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.barber_shorts
    SET comments_count = comments_count + 1
    WHERE id = NEW.short_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.barber_shorts
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.short_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comments count
DROP TRIGGER IF EXISTS trigger_update_short_comments_count ON public.shorts_comments;
CREATE TRIGGER trigger_update_short_comments_count
AFTER INSERT OR DELETE ON public.shorts_comments
FOR EACH ROW
EXECUTE FUNCTION update_short_comments_count();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_shorts_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_shorts_comments_updated_at ON public.shorts_comments;
CREATE TRIGGER trigger_update_shorts_comments_updated_at
BEFORE UPDATE ON public.shorts_comments
FOR EACH ROW
EXECUTE FUNCTION update_shorts_comments_updated_at();

-- Enable Row Level Security
ALTER TABLE public.shorts_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shorts_comments

-- Anyone can view comments
CREATE POLICY "Anyone can view comments"
ON public.shorts_comments FOR SELECT
USING (true);

-- Authenticated users can add comments
CREATE POLICY "Authenticated users can add comments"
ON public.shorts_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
ON public.shorts_comments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.shorts_comments FOR DELETE
USING (auth.uid() = user_id);

-- Barbers can delete comments on their shorts
CREATE POLICY "Barbers can delete comments on their shorts"
ON public.shorts_comments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.barber_shorts
    WHERE id = shorts_comments.short_id
    AND barber_id = auth.uid()
  )
);
