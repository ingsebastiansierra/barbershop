-- =====================================================
-- Complete Super Admin Access Fix
-- Grant super admins full read access to all tables
-- =====================================================

-- =====================================================
-- USERS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;

CREATE POLICY "Super admins can view all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- BARBERS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Super admins can view all barbers" ON public.barbers;

CREATE POLICY "Super admins can view all barbers"
  ON public.barbers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Super admins can view all appointments" ON public.appointments;

CREATE POLICY "Super admins can view all appointments"
  ON public.appointments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- SALES TABLE
-- =====================================================
DROP POLICY IF EXISTS "Super admins can view all sales" ON public.sales;

CREATE POLICY "Super admins can view all sales"
  ON public.sales
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- SERVICES TABLE
-- =====================================================
DROP POLICY IF EXISTS "Super admins can view all services" ON public.services;

CREATE POLICY "Super admins can view all services"
  ON public.services
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- BARBERSHOPS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Super admins can view all barbershops" ON public.barbershops;

CREATE POLICY "Super admins can view all barbershops"
  ON public.barbershops
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- ADMIN_ASSIGNMENTS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Super admins can view all admin assignments" ON public.admin_assignments;

CREATE POLICY "Super admins can view all admin assignments"
  ON public.admin_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- =====================================================
-- Verify all policies
-- =====================================================
SELECT 
  tablename, 
  policyname,
  cmd as operation
FROM pg_policies
WHERE policyname LIKE '%Super admins%'
ORDER BY tablename, policyname;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Super admin policies created successfully!';
  RAISE NOTICE 'Super admins now have read access to all tables.';
END $$;
