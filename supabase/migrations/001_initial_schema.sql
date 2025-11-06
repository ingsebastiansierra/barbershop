-- =====================================================
-- MIGRATION 001: Initial Schema Setup
-- Compatible with existing Supabase database
-- =====================================================

-- =====================================================
-- STEP 1: Enable Extensions
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =====================================================
-- STEP 2: Create Enums
-- =====================================================

-- Drop existing enums if they exist (for clean migration)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS appointment_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS waitlist_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- Create new enums
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'barber', 'client');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer');
CREATE TYPE waitlist_status AS ENUM ('waiting', 'notified', 'confirmed', 'expired');
CREATE TYPE notification_type AS ENUM ('appointment', 'reminder', 'cancellation', 'waitlist', 'system');

-- =====================================================
-- STEP 3: Create Tables
-- =====================================================

-- Table: users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  barbershop_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: barbershops
CREATE TABLE IF NOT EXISTS public.barbershops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326),
  is_active BOOLEAN NOT NULL DEFAULT true,
  opening_hours JSONB NOT NULL DEFAULT '{
    "monday": {"open": "09:00", "close": "18:00"},
    "tuesday": {"open": "09:00", "close": "18:00"},
    "wednesday": {"open": "09:00", "close": "18:00"},
    "thursday": {"open": "09:00", "close": "18:00"},
    "friday": {"open": "09:00", "close": "18:00"},
    "saturday": {"open": "09:00", "close": "15:00"},
    "sunday": null
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: admin_assignments
CREATE TABLE IF NOT EXISTS public.admin_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, barbershop_id)
);

-- Table: barbers
CREATE TABLE IF NOT EXISTS public.barbers (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  specialties TEXT[] DEFAULT ARRAY[]::TEXT[],
  bio TEXT,
  rating DECIMAL(3, 2) DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  total_reviews INTEGER DEFAULT 0 CHECK (total_reviews >= 0),
  is_active BOOLEAN NOT NULL DEFAULT true,
  schedule JSONB NOT NULL DEFAULT '{
    "monday": [{"start": "09:00", "end": "18:00"}],
    "tuesday": [{"start": "09:00", "end": "18:00"}],
    "wednesday": [{"start": "09:00", "end": "18:00"}],
    "thursday": [{"start": "09:00", "end": "18:00"}],
    "friday": [{"start": "09:00", "end": "18:00"}],
    "saturday": [{"start": "09:00", "end": "15:00"}],
    "sunday": null
  }'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: services
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes % 15 = 0),
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  is_combo BOOLEAN NOT NULL DEFAULT false,
  combo_services UUID[] DEFAULT ARRAY[]::UUID[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status appointment_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  payment_method payment_method,
  total_price DECIMAL(10, 2) NOT NULL CHECK (total_price >= 0),
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

-- Table: waitlist
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  preferred_date DATE NOT NULL,
  preferred_time TIME,
  status waitlist_status NOT NULL DEFAULT 'waiting',
  notified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type notification_type NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- STEP 4: Create Indexes
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_barbershop_id ON public.users(barbershop_id);

-- Add foreign key constraint for users.barbershop_id
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS fk_users_barbershop 
FOREIGN KEY (barbershop_id) 
REFERENCES public.barbershops(id) 
ON DELETE SET NULL;

-- Barbershops indexes
CREATE INDEX IF NOT EXISTS idx_barbershops_is_active ON public.barbershops(is_active);
CREATE INDEX IF NOT EXISTS idx_barbershops_location ON public.barbershops USING GIST(location);

-- Admin assignments indexes
CREATE INDEX IF NOT EXISTS idx_admin_assignments_user_id ON public.admin_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_assignments_barbershop_id ON public.admin_assignments(barbershop_id);

-- Barbers indexes
CREATE INDEX IF NOT EXISTS idx_barbers_barbershop_id ON public.barbers(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barbers_is_active ON public.barbers(is_active);

-- Services indexes
CREATE INDEX IF NOT EXISTS idx_services_barbershop_id ON public.services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_services_is_active ON public.services(is_active);

-- Appointments indexes
CREATE INDEX IF NOT EXISTS idx_appointments_barbershop_id ON public.appointments(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_appointments_barber_id ON public.appointments(barber_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON public.appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_barber_date ON public.appointments(barber_id, appointment_date);

-- Waitlist indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_barbershop_id ON public.waitlist(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_barber_id ON public.waitlist(barber_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_client_id ON public.waitlist(client_id);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON public.waitlist(status);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- =====================================================
-- STEP 5: Create Functions and Triggers
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS barbershops_updated_at ON public.barbershops;
CREATE TRIGGER barbershops_updated_at
  BEFORE UPDATE ON public.barbershops
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS barbers_updated_at ON public.barbers;
CREATE TRIGGER barbers_updated_at
  BEFORE UPDATE ON public.barbers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS services_updated_at ON public.services;
CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS appointments_updated_at ON public.appointments;
CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS waitlist_updated_at ON public.waitlist;
CREATE TRIGGER waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to update barbershop location from lat/lng
CREATE OR REPLACE FUNCTION public.update_barbershop_location()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS barbershops_location_trigger ON public.barbershops;
CREATE TRIGGER barbershops_location_trigger
  BEFORE INSERT OR UPDATE ON public.barbershops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_barbershop_location();

-- Function to check if a time slot is available
CREATE OR REPLACE FUNCTION public.is_time_slot_available(
  p_barber_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO conflict_count
  FROM public.appointments
  WHERE barber_id = p_barber_id
    AND appointment_date = p_date
    AND status IN ('pending', 'confirmed')
    AND (id != p_exclude_appointment_id OR p_exclude_appointment_id IS NULL)
    AND (
      (start_time < p_end_time AND end_time > p_start_time)
    );
  
  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get nearby barbershops
CREATE OR REPLACE FUNCTION public.get_nearby_barbershops(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_radius_meters INTEGER DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  address TEXT,
  phone TEXT,
  logo_url TEXT,
  distance_meters DOUBLE PRECISION
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.name,
    b.address,
    b.phone,
    b.logo_url,
    ST_Distance(
      b.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography
    ) AS distance_meters
  FROM public.barbershops b
  WHERE b.is_active = true
    AND ST_DWithin(
      b.location,
      ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326)::geography,
      p_radius_meters
    )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 6: Enable RLS
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 7: Create RLS Policies
-- =====================================================

-- USERS TABLE POLICIES
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "users_select_barbers" ON public.users FOR SELECT USING (
  role = 'barber' AND EXISTS (SELECT 1 FROM public.barbers WHERE barbers.id = users.id AND barbers.is_active = true)
);
CREATE POLICY "users_select_super_admin" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'super_admin')
);
CREATE POLICY "users_select_admin" ON public.users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments aa
    JOIN public.barbers b ON b.barbershop_id = aa.barbershop_id
    WHERE aa.user_id = auth.uid() AND b.id = users.id
  )
);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users_insert_own" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_super_admin" ON public.users FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'super_admin')
);

-- BARBERSHOPS TABLE POLICIES
CREATE POLICY "barbershops_select_active" ON public.barbershops FOR SELECT USING (is_active = true);
CREATE POLICY "barbershops_select_super_admin" ON public.barbershops FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "barbershops_select_admin" ON public.barbershops FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = barbershops.id)
);
CREATE POLICY "barbershops_insert_super_admin" ON public.barbershops FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "barbershops_update_super_admin" ON public.barbershops FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "barbershops_update_admin" ON public.barbershops FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = barbershops.id)
);
CREATE POLICY "barbershops_delete_super_admin" ON public.barbershops FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- ADMIN_ASSIGNMENTS TABLE POLICIES
CREATE POLICY "admin_assignments_select_super_admin" ON public.admin_assignments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "admin_assignments_select_own" ON public.admin_assignments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "admin_assignments_insert_super_admin" ON public.admin_assignments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "admin_assignments_delete_super_admin" ON public.admin_assignments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- BARBERS TABLE POLICIES
CREATE POLICY "barbers_select_active" ON public.barbers FOR SELECT USING (is_active = true);
CREATE POLICY "barbers_select_super_admin" ON public.barbers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "barbers_select_admin" ON public.barbers FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = barbers.barbershop_id)
);
CREATE POLICY "barbers_insert_admin" ON public.barbers FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = barbers.barbershop_id)
);
CREATE POLICY "barbers_update_admin" ON public.barbers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = barbers.barbershop_id)
);
CREATE POLICY "barbers_update_own" ON public.barbers FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "barbers_update_super_admin" ON public.barbers FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- SERVICES TABLE POLICIES
CREATE POLICY "services_select_active" ON public.services FOR SELECT USING (is_active = true);
CREATE POLICY "services_select_super_admin" ON public.services FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "services_select_admin" ON public.services FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = services.barbershop_id)
);
CREATE POLICY "services_insert_admin" ON public.services FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = services.barbershop_id)
);
CREATE POLICY "services_update_admin" ON public.services FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = services.barbershop_id)
);
CREATE POLICY "services_delete_admin" ON public.services FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = services.barbershop_id)
);
CREATE POLICY "services_all_super_admin" ON public.services FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- APPOINTMENTS TABLE POLICIES
CREATE POLICY "appointments_select_client" ON public.appointments FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "appointments_select_barber" ON public.appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.barbers WHERE id = auth.uid() AND barbershop_id = appointments.barbershop_id)
);
CREATE POLICY "appointments_select_admin" ON public.appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = appointments.barbershop_id)
);
CREATE POLICY "appointments_select_super_admin" ON public.appointments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "appointments_insert_client" ON public.appointments FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "appointments_update_client" ON public.appointments FOR UPDATE USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY "appointments_update_barber" ON public.appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.barbers WHERE id = auth.uid() AND barbershop_id = appointments.barbershop_id)
);
CREATE POLICY "appointments_update_admin" ON public.appointments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = appointments.barbershop_id)
);
CREATE POLICY "appointments_all_super_admin" ON public.appointments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);

-- WAITLIST TABLE POLICIES
CREATE POLICY "waitlist_select_client" ON public.waitlist FOR SELECT USING (client_id = auth.uid());
CREATE POLICY "waitlist_select_barber" ON public.waitlist FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.barbers WHERE id = auth.uid() AND barbershop_id = waitlist.barbershop_id)
);
CREATE POLICY "waitlist_select_admin" ON public.waitlist FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = waitlist.barbershop_id)
);
CREATE POLICY "waitlist_select_super_admin" ON public.waitlist FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'super_admin')
);
CREATE POLICY "waitlist_insert_client" ON public.waitlist FOR INSERT WITH CHECK (client_id = auth.uid());
CREATE POLICY "waitlist_update_client" ON public.waitlist FOR UPDATE USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
CREATE POLICY "waitlist_update_barber" ON public.waitlist FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.barbers WHERE id = auth.uid() AND barbershop_id = waitlist.barbershop_id)
);
CREATE POLICY "waitlist_update_admin" ON public.waitlist FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = waitlist.barbershop_id)
);
CREATE POLICY "waitlist_delete_admin" ON public.waitlist FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.admin_assignments WHERE user_id = auth.uid() AND barbershop_id = waitlist.barbershop_id)
);

-- NOTIFICATIONS TABLE POLICIES
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "notifications_insert_system" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 001 completed successfully!';
  RAISE NOTICE 'Created 8 tables with RLS policies';
  RAISE NOTICE 'Created indexes for performance';
  RAISE NOTICE 'Created helper functions';
END $$;
