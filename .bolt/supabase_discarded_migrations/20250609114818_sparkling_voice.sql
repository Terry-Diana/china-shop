/*
  # Create Default Super Admin Account

  1. New Features
    - Creates a default super admin account with predefined credentials
    - Email: superadmin@chinasquare.com
    - Password: adminsuper@123
    - Role: super_admin
  
  2. Security
    - Uses Supabase's built-in auth system
    - Enables RLS on admins table
    - Creates policy for admin access
  
  3. Notes
    - This creates a default account for immediate access
    - The password is hashed by Supabase's auth system
    - Admin can change credentials after first login
*/

-- First, ensure the admins table exists with proper structure
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

-- Create policy for admins to access their own data
CREATE POLICY "Admins can read own data"
  ON admins
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for admins to update their own data
CREATE POLICY "Admins can update own data"
  ON admins
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create the default super admin user in auth.users
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Check if the super admin already exists
  SELECT id INTO user_id 
  FROM auth.users 
  WHERE email = 'superadmin@chinasquare.com';
  
  -- If user doesn't exist, create them
  IF user_id IS NULL THEN
    -- Insert into auth.users (this is a simplified approach)
    -- Note: In production, you'd typically use Supabase's signUp function
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'superadmin@chinasquare.com',
      crypt('adminsuper@123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Super Admin"}',
      false,
      '',
      '',
      '',
      ''
    ) RETURNING id INTO user_id;
    
    -- Insert into admins table
    INSERT INTO admins (id, email, name, role)
    VALUES (user_id, 'superadmin@chinasquare.com', 'Super Admin', 'super_admin');
  END IF;
END $$;