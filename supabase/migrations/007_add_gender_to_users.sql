-- =====================================================
-- ADD GENDER FIELD TO USERS TABLE
-- Migration: 007_add_gender_to_users
-- =====================================================

-- Create gender enum type
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- Add gender column to users table
ALTER TABLE public.users
ADD COLUMN gender user_gender DEFAULT 'prefer_not_to_say';

-- Add comment to column
COMMENT ON COLUMN public.users.gender IS 'User gender for personalized experience';

-- Update existing users to have a default value (optional)
-- UPDATE public.users SET gender = 'prefer_not_to_say' WHERE gender IS NULL;
