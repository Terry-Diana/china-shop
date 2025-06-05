/*
  # Add banners table for CMS

  1. New Tables
    - `banners` - Store homepage banners and promotional content
      - `id` (uuid, primary key)
      - `title` (text)
      - `subtitle` (text)
      - `image_url` (text)
      - `link` (text)
      - `sort_order` (integer)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on banners table
    - Add policies for public read access
    - Add policies for admin write access
*/

CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Everyone can view banners
CREATE POLICY "Banners are viewable by everyone"
  ON banners
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only authenticated users with admin role can modify banners
CREATE POLICY "Admins can modify banners"
  ON banners
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  )
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  );

-- Create trigger for updated_at
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();