-- =====================================================
-- BARBERSHOP MANAGEMENT APP - DATABASE SCHEMA
-- Complete schema with tables, RLS policies, and functions
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For geolocation features

-- =====================================================
-- ENUMS
-- =====================================================

-- User roles
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'barber', 'client');

-- Appointment status
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Payment status
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');

-- Payment method
CREATE TYPE payment_method AS ENUM ('cash', 'card', 'transfer');

-- Waitlist status
CREATE TYPE waitlist_status AS ENUM ('waiting', 'notified', 'confirmed', 'expired');

-- Notification type
CREATE TYPE notification_type AS ENUM ('appointment', 'reminder', 'cancellation', 'waitlist', 'system');

-- =====================================================
-- TABLE: users
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- TABLE: barbershops
-- =====================================================
CREATE TABLE IF NOT EXISTS public.barbershops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  logo_url TEXT,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  location GEOGRAPHY(POINT, 4326), -- PostGIS point for geospatial queries
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

-- =====================================================
-- TABLE: admin_assignments
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  barbershop_id UUID NOT NULL REFERENCES public.barbershops(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, barbershop_id)
);

-- =====================================================
-- TABLE: barbers
-- =====================================================
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

-- =====================================================
-- TABLE: services
-- =====================================================
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

-- =====================================================
-- TABLE: appointments
-- =====================================================
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

-- =====================================================
-- TABLE: waitlist
-- =====================================================
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

-- =====================================================
-- TABLE: notifications
-- =====================================================
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
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

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
-- TRIGGERS
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
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER barbershops_updated_at
  BEFORE UPDATE ON public.barbershops
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER barbers_updated_at
  BEFORE UPDATE ON public.barbers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

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

CREATE TRIGGER barbershops_location_trigger
  BEFORE INSERT OR UPDATE ON public.barbershops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_barbershop_location();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Users can view their own profile
CREATE POLICY "users_select_own"
ON public.users FOR SELECT
USING (auth.uid() = id);

-- Users can view active barbers
CREATE POLICY "users_select_barbers"
ON public.users FOR SELECT
USING (
  role = 'barber' AND
  EXISTS (SELECT 1 FROM public.barbers WHERE barbers.id = users.id AND barbers.is_active = true)
);

-- Super admins can view all users
CREATE POLICY "users_select_super_admin"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'super_admin'
  )
);

-- Admins can view users in their barbershop
CREATE POLICY "users_select_admin"
ON public.users FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments aa
    JOIN public.barbers b ON b.barbershop_id = aa.barbershop_id
    WHERE aa.user_id = auth.uid() AND b.id = users.id
  )
);

-- Users can update their own profile
CREATE POLICY "users_update_own"
ON public.users FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (during registration)
CREATE POLICY "users_insert_own"
ON public.users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Super admins can update any user
CREATE POLICY "users_update_super_admin"
ON public.users FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid() AND u.role = 'super_admin'
  )
);

-- =====================================================
-- BARBERSHOPS TABLE POLICIES
-- =====================================================

-- Everyone can view active barbershops
CREATE POLICY "barbershops_select_active"
ON public.barbershops FOR SELECT
USING (is_active = true);

-- Super admins can view all barbershops
CREATE POLICY "barbershops_select_super_admin"
ON public.barbershops FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Admins can view their assigned barbershop
CREATE POLICY "barbershops_select_admin"
ON public.barbershops FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = barbershops.id
  )
);

-- Super admins can insert barbershops
CREATE POLICY "barbershops_insert_super_admin"
ON public.barbershops FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Super admins can update any barbershop
CREATE POLICY "barbershops_update_super_admin"
ON public.barbershops FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Admins can update their assigned barbershop
CREATE POLICY "barbershops_update_admin"
ON public.barbershops FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = barbershops.id
  )
);

-- Super admins can delete barbershops
CREATE POLICY "barbershops_delete_super_admin"
ON public.barbershops FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- =====================================================
-- ADMIN_ASSIGNMENTS TABLE POLICIES
-- =====================================================

-- Super admins can view all assignments
CREATE POLICY "admin_assignments_select_super_admin"
ON public.admin_assignments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Admins can view their own assignments
CREATE POLICY "admin_assignments_select_own"
ON public.admin_assignments FOR SELECT
USING (user_id = auth.uid());

-- Super admins can insert assignments
CREATE POLICY "admin_assignments_insert_super_admin"
ON public.admin_assignments FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Super admins can delete assignments
CREATE POLICY "admin_assignments_delete_super_admin"
ON public.admin_assignments FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- =====================================================
-- BARBERS TABLE POLICIES
-- =====================================================

-- Everyone can view active barbers
CREATE POLICY "barbers_select_active"
ON public.barbers FOR SELECT
USING (is_active = true);

-- Super admins can view all barbers
CREATE POLICY "barbers_select_super_admin"
ON public.barbers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Admins can view barbers in their barbershop
CREATE POLICY "barbers_select_admin"
ON public.barbers FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = barbers.barbershop_id
  )
);

-- Admins can insert barbers in their barbershop
CREATE POLICY "barbers_insert_admin"
ON public.barbers FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = barbers.barbershop_id
  )
);

-- Admins can update barbers in their barbershop
CREATE POLICY "barbers_update_admin"
ON public.barbers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = barbers.barbershop_id
  )
);

-- Barbers can update their own profile
CREATE POLICY "barbers_update_own"
ON public.barbers FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Super admins can update any barber
CREATE POLICY "barbers_update_super_admin"
ON public.barbers FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- =====================================================
-- SERVICES TABLE POLICIES
-- =====================================================

-- Everyone can view active services
CREATE POLICY "services_select_active"
ON public.services FOR SELECT
USING (is_active = true);

-- Super admins can view all services
CREATE POLICY "services_select_super_admin"
ON public.services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Admins can view services in their barbershop
CREATE POLICY "services_select_admin"
ON public.services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = services.barbershop_id
  )
);

-- Admins can insert services in their barbershop
CREATE POLICY "services_insert_admin"
ON public.services FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = services.barbershop_id
  )
);

-- Admins can update services in their barbershop
CREATE POLICY "services_update_admin"
ON public.services FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = services.barbershop_id
  )
);

-- Admins can delete services in their barbershop
CREATE POLICY "services_delete_admin"
ON public.services FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = services.barbershop_id
  )
);

-- Super admins can manage all services
CREATE POLICY "services_all_super_admin"
ON public.services FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- =====================================================
-- APPOINTMENTS TABLE POLICIES
-- =====================================================

-- Clients can view their own appointments
CREATE POLICY "appointments_select_client"
ON public.appointments FOR SELECT
USING (client_id = auth.uid());

-- Barbers can view appointments in their barbershop
CREATE POLICY "appointments_select_barber"
ON public.appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.barbers
    WHERE id = auth.uid() AND barbershop_id = appointments.barbershop_id
  )
);

-- Admins can view appointments in their barbershop
CREATE POLICY "appointments_select_admin"
ON public.appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = appointments.barbershop_id
  )
);

-- Super admins can view all appointments
CREATE POLICY "appointments_select_super_admin"
ON public.appointments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Clients can create appointments
CREATE POLICY "appointments_insert_client"
ON public.appointments FOR INSERT
WITH CHECK (client_id = auth.uid());

-- Clients can update their own appointments (cancel, add notes)
CREATE POLICY "appointments_update_client"
ON public.appointments FOR UPDATE
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

-- Barbers can update appointments in their barbershop
CREATE POLICY "appointments_update_barber"
ON public.appointments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.barbers
    WHERE id = auth.uid() AND barbershop_id = appointments.barbershop_id
  )
);

-- Admins can update appointments in their barbershop
CREATE POLICY "appointments_update_admin"
ON public.appointments FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = appointments.barbershop_id
  )
);

-- Super admins can manage all appointments
CREATE POLICY "appointments_all_super_admin"
ON public.appointments FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- =====================================================
-- WAITLIST TABLE POLICIES
-- =====================================================

-- Clients can view their own waitlist entries
CREATE POLICY "waitlist_select_client"
ON public.waitlist FOR SELECT
USING (client_id = auth.uid());

-- Barbers can view waitlist in their barbershop
CREATE POLICY "waitlist_select_barber"
ON public.waitlist FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.barbers
    WHERE id = auth.uid() AND barbershop_id = waitlist.barbershop_id
  )
);

-- Admins can view waitlist in their barbershop
CREATE POLICY "waitlist_select_admin"
ON public.waitlist FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = waitlist.barbershop_id
  )
);

-- Super admins can view all waitlist entries
CREATE POLICY "waitlist_select_super_admin"
ON public.waitlist FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'super_admin'
  )
);

-- Clients can create waitlist entries
CREATE POLICY "waitlist_insert_client"
ON public.waitlist FOR INSERT
WITH CHECK (client_id = auth.uid());

-- Clients can update their own waitlist entries
CREATE POLICY "waitlist_update_client"
ON public.waitlist FOR UPDATE
USING (client_id = auth.uid())
WITH CHECK (client_id = auth.uid());

-- Barbers can update waitlist in their barbershop
CREATE POLICY "waitlist_update_barber"
ON public.waitlist FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.barbers
    WHERE id = auth.uid() AND barbershop_id = waitlist.barbershop_id
  )
);

-- Admins can update waitlist in their barbershop
CREATE POLICY "waitlist_update_admin"
ON public.waitlist FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = waitlist.barbershop_id
  )
);

-- Admins can delete waitlist entries in their barbershop
CREATE POLICY "waitlist_delete_admin"
ON public.waitlist FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.admin_assignments
    WHERE user_id = auth.uid() AND barbershop_id = waitlist.barbershop_id
  )
);

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "notifications_select_own"
ON public.notifications FOR SELECT
USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
ON public.notifications FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- System can insert notifications (via service role)
CREATE POLICY "notifications_insert_system"
ON public.notifications FOR INSERT
WITH CHECK (true);

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
ON public.notifications FOR DELETE
USING (user_id = auth.uid());

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

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
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.users IS 'User accounts with role-based access';
COMMENT ON TABLE public.barbershops IS 'Barbershop locations and details';
COMMENT ON TABLE public.admin_assignments IS 'Admin to barbershop assignments';
COMMENT ON TABLE public.barbers IS 'Barber profiles with schedules';
COMMENT ON TABLE public.services IS 'Services offered by barbershops';
COMMENT ON TABLE public.appointments IS 'Client appointments with barbers';
COMMENT ON TABLE public.waitlist IS 'Waitlist for unavailable time slots';
COMMENT ON TABLE public.notifications IS 'User notifications';

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Database schema created successfully!';
  RAISE NOTICE 'Tables: users, barbershops, admin_assignments, barbers, services, appointments, waitlist, notifications';
  RAISE NOTICE 'RLS policies enabled on all tables';
  RAISE NOTICE 'Indexes created for optimal query performance';
END $$;
