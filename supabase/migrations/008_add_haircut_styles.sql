-- =====================================================
-- ADD HAIRCUT STYLES TABLE
-- Migration: 008_add_haircut_styles
-- =====================================================

-- Create haircut styles table
CREATE TABLE IF NOT EXISTS public.haircut_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  gender user_gender NOT NULL, -- male, female, other, prefer_not_to_say
  image_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add index for faster queries by gender
CREATE INDEX idx_haircut_styles_gender ON public.haircut_styles(gender);
CREATE INDEX idx_haircut_styles_active ON public.haircut_styles(is_active);

-- Add haircut_style_id to appointments table
ALTER TABLE public.appointments
ADD COLUMN haircut_style_id UUID REFERENCES public.haircut_styles(id) ON DELETE SET NULL;

-- Add index for appointments haircut_style_id
CREATE INDEX idx_appointments_haircut_style ON public.appointments(haircut_style_id);

-- Insert default haircut styles for men
INSERT INTO public.haircut_styles (name, description, gender, image_url) VALUES
('Fade Clásico', 'Degradado clásico con transición suave de largo a corto', 'male', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400'),
('Undercut', 'Lados y nuca rapados con volumen arriba', 'male', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400'),
('Pompadour', 'Estilo vintage con volumen hacia atrás', 'male', 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400'),
('Buzz Cut', 'Corte militar muy corto y uniforme', 'male', 'https://images.unsplash.com/photo-1627834377411-8da5f4f09de8?w=400'),
('Quiff', 'Flequillo levantado con lados cortos', 'male', 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400'),
('Crew Cut', 'Corte deportivo corto y práctico', 'male', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400'),
('Taper Fade', 'Degradado progresivo desde arriba', 'male', 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400'),
('Mullet Moderno', 'Corto adelante, largo atrás - estilo moderno', 'male', 'https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400');

-- Insert default haircut styles for women
INSERT INTO public.haircut_styles (name, description, gender, image_url) VALUES
('Bob Clásico', 'Corte recto a la altura de la mandíbula', 'female', 'https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400'),
('Pixie Cut', 'Corte muy corto y moderno', 'female', 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400'),
('Capas Largas', 'Cabello largo con capas para volumen', 'female', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400'),
('Shag', 'Corte desfilado con textura y movimiento', 'female', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400'),
('Lob (Long Bob)', 'Bob largo hasta los hombros', 'female', 'https://images.unsplash.com/photo-1595475884562-073c30d45670?w=400'),
('Flequillo Cortina', 'Flequillo abierto al medio con capas', 'female', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400'),
('Corte Recto', 'Corte uniforme sin capas', 'female', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400'),
('Wolf Cut', 'Mezcla de shag y mullet moderno', 'female', 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400');

-- Insert unisex/other styles
INSERT INTO public.haircut_styles (name, description, gender, image_url) VALUES
('Corte Personalizado', 'Diseño único según tu estilo', 'other', 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400'),
('Mantenimiento', 'Recorte y mantenimiento del estilo actual', 'other', 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400');

-- Add comment
COMMENT ON TABLE public.haircut_styles IS 'Catalog of haircut styles categorized by gender';
COMMENT ON COLUMN public.appointments.haircut_style_id IS 'Reference to the selected haircut style for this appointment';

-- Enable RLS
ALTER TABLE public.haircut_styles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for haircut_styles
CREATE POLICY "Haircut styles are viewable by everyone"
  ON public.haircut_styles FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only super_admin can insert haircut styles"
  ON public.haircut_styles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Only super_admin can update haircut styles"
  ON public.haircut_styles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );

CREATE POLICY "Only super_admin can delete haircut styles"
  ON public.haircut_styles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'super_admin'
    )
  );
