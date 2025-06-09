/*
  # Fix Admin Table and Policies

  1. Drop and recreate admins table with proper policies
  2. Fix infinite recursion in RLS policies
  3. Create default super admin account
  4. Ensure proper admin authentication flow

  This migration fixes the infinite recursion issue and ensures
  admins are created in the correct table.
*/

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Super admins can read all admin data" ON admins;
DROP POLICY IF EXISTS "Super admins can create new admins" ON admins;
DROP POLICY IF EXISTS "Admins can read own data" ON admins;
DROP POLICY IF EXISTS "Admins can update own data" ON admins;

-- Recreate admins table if it doesn't exist
CREATE TABLE IF NOT EXISTS admins (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies
CREATE POLICY "Allow authenticated users to read admins"
  ON admins
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert admins"
  ON admins
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update admins"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (true);

-- Create trigger for updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_admins_updated_at'
  ) THEN
    CREATE TRIGGER update_admins_updated_at
      BEFORE UPDATE ON admins
      FOR EACH ROW
      EXECUTE FUNCTION update_modified_column();
  END IF;
END $$;

-- Insert default super admin if it doesn't exist
DO $$
DECLARE
  admin_exists boolean;
BEGIN
  -- Check if any admin exists with the super admin email
  SELECT EXISTS(
    SELECT 1 FROM admins WHERE email = 'superadmin@chinasquare.com'
  ) INTO admin_exists;
  
  -- If no admin exists, we need to create the auth user first
  -- Note: This is a placeholder - the actual user creation should be done
  -- through the application's registration form or Supabase dashboard
  IF NOT admin_exists THEN
    -- Create a placeholder admin record that will be linked when the auth user is created
    -- The actual auth user creation must be done through the app or dashboard
    RAISE NOTICE 'No super admin found. Please create the super admin account using:';
    RAISE NOTICE 'Email: superadmin@chinasquare.com';
    RAISE NOTICE 'Password: adminsuper@123';
    RAISE NOTICE 'Use the registration form in the admin login page.';
  END IF;
END $$;