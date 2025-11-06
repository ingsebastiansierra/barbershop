-- =====================================================
-- Fix Infinite Recursion in Super Admin Policies
-- Use security definer function to avoid recursion
-- =====================================================

-- Create a security definer function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.users 
    WHERE id = auth.uid() 
    AND role = 'super_admin'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- =====================================================
-- Drop all existing super admin policies
-- =====================================================
DROP POLICY IF EXISTS "Super admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Super admins can view all barbers" ON public.barbers;
DROP POLICY IF EXISTS "Super admins can view all appointments" ON public.appointments;
DROP POLICY IF EXISTS "Super admins can view all sales" ON public.sales;
DROP POLICY IF EXISTS "Super admins can view all services" ON public.services;
DROP POLICY IF EXISTS "Super admins can view all barbershops" ON public.barbershops;
DROP POLICY IF EXISTS "Super admins can view all admin assignments" ON public.admin_assignments;

-- =====================================================
-- Create new policies using the security definer function
-- =====================================================

-- USERS TABLE
CREATE POLICY "Super admins can view all users"
  ON public.users
  FOR SELECT
  USING (public.is_super_admin());

-- BARBERS TABLE
CREATE POLICY "Super admins can view all barbers"
  ON public.barbers
  FOR SELECT
  USING (public.is_super_admin());

-- APPOINTMENTS TABLE
CREATE POLICY "Super admins can view all appointments"
  ON public.appointments
  FOR SELECT
  USING (public.is_super_admin());

-- SALES TABLE
CREATE POLICY "Super admins can view all sales"
  ON public.sales
  FOR SELECT
  USING (public.is_super_admin());

-- SERVICES TABLE
CREATE POLICY "Super admins can view all services"
  ON public.services
  FOR SELECT
  USING (public.is_super_admin());

-- BARBERSHOPS TABLE
CREATE POLICY "Super admins can view all barbershops"
  ON public.barbershops
  FOR SELECT
  USING (public.is_super_admin());

-- ADMIN_ASSIGNMENTS TABLE
CREATE POLICY "Super admins can view all admin assignments"
  ON public.admin_assignments
  FOR SELECT
  USING (public.is_super_admin());

-- =====================================================
-- Verify policies
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
  RAISE NOTICE '✅ Super admin policies fixed!';
  RAISE NOTICE '✅ Infinite recursion issue resolved using security definer function.';
END $$;

COMMENT ON FUNCTION public.is_super_admin() IS 'Security definer function to check if current user is a super admin, avoiding infinite recursion in RLS policies';
