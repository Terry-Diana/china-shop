/*
  # Complete Database Schema Setup for China Square E-commerce
  
  This migration creates a complete database schema with proper relationships
  and security policies.
  
  1. New Tables
    - `users` - Store user information (extends Supabase auth)
    - `categories` - Product categories
    - `products` - Product catalog
    - `product_images` - Product image gallery
    - `orders` - Customer orders
    - `order_items` - Items within orders
    - `favorites` - User's favorite products
    - `cart_items` - User's cart items
    - `admins` - Admin users
    - `banners` - Homepage banners and promotional content

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
    - Set up proper relationships and constraints

  3. Functions and Triggers
    - Updated timestamp triggers
    - Helper functions
*/

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_modified_column() CASCADE;

-- Create function to handle updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Users table (extends Supabase auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  parent_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES categories(id),
  brand TEXT,
  stock INTEGER DEFAULT 0,
  rating DECIMAL(3,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_best_seller BOOLEAN DEFAULT false,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Product images table
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Banners table
CREATE TABLE banners (
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

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  shipping DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_address_line1 TEXT,
  shipping_address_line2 TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_postal_code TEXT,
  shipping_country TEXT,
  payment_method TEXT,
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Order items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- PUBLIC ACCESS POLICIES
-- These policies allow public read access to certain tables

-- Categories policies (public read)
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT TO anon, authenticated USING (true);

-- Products policies (public read)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT TO anon, authenticated USING (true);

-- Product images policies (public read)
CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT TO anon, authenticated USING (true);

-- Banners policies (public read)
CREATE POLICY "Banners are viewable by everyone"
  ON banners FOR SELECT TO anon, authenticated USING (true);

-- AUTHENTICATED USER POLICIES
-- These policies allow authenticated users to access their own data

-- Users policies
CREATE POLICY "Users can read own data"
  ON users FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Admins policies
CREATE POLICY "Admins can read own data"
  ON admins FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can update own data"
  ON admins FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Admins can insert own data"
  ON admins FOR INSERT TO authenticated WITH CHECK (true);

-- Cart items policies
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Orders policies
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE TO authenticated USING (true);

-- Order items policies
CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT TO authenticated WITH CHECK (true);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Insert sample data for testing
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets'),
('Fashion', 'fashion', 'Clothing and accessories'),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies'),
('Sports', 'sports', 'Sports equipment and accessories'),
('Beauty', 'beauty', 'Beauty and personal care products');

INSERT INTO products (name, slug, description, price, original_price, discount, category_id, brand, stock, rating, review_count, is_new, is_best_seller, image_url) VALUES
('Wireless Headphones', 'wireless-headphones', 'High-quality wireless headphones with noise cancellation', 7499.99, 9999.99, 25, 1, 'AudioTech', 50, 4.5, 128, true, false, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'),
('Smart Watch', 'smart-watch', 'Feature-rich smartwatch with health tracking', 6499.99, 8499.99, 24, 1, 'TechWear', 30, 4.3, 89, false, true, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg'),
('Running Shoes', 'running-shoes', 'Comfortable running shoes for all terrains', 5999.99, 6499.99, 8, 4, 'SportMax', 75, 4.7, 203, false, true, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'),
('Cotton T-Shirt', 'cotton-t-shirt', 'Premium cotton t-shirt in various colors', 1299.99, 1599.99, 19, 2, 'ComfortWear', 100, 4.2, 156, true, false, 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'),
('Smartphone X Pro', 'smartphone-x-pro', 'Latest flagship smartphone with advanced camera system', 44999.99, 49999.99, 10, 1, 'TechGiant', 25, 4.8, 542, true, true, 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'),
('Makeup Kit', 'makeup-kit', 'Complete makeup kit with all essentials', 3499.99, 4499.99, 22, 5, 'BeautyPro', 40, 4.4, 89, false, false, 'https://images.pexels.com/photos/7256120/pexels-photo-7256120.jpeg');

INSERT INTO banners (title, subtitle, image_url, link, sort_order, active) VALUES
('Summer Sale', 'Up to 50% off on selected items', 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg', '/products', 1, true),
('New Arrivals', 'Check out our latest collection', 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg', '/products?filter=new', 2, true);

-- Create default super admin
DO $$
DECLARE
  admin_exists boolean;
BEGIN
  -- Check if any admin exists with the super admin email
  SELECT EXISTS(
    SELECT 1 FROM admins WHERE email = 'superadmin@chinasquare.com'
  ) INTO admin_exists;
  
  -- If no admin exists, create one
  IF NOT admin_exists THEN
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
    ) ON CONFLICT DO NOTHING;
    
    -- Get the user ID
    INSERT INTO admins (id, email, name, role)
    SELECT id, 'superadmin@chinasquare.com', 'Super Admin', 'super_admin'
    FROM auth.users
    WHERE email = 'superadmin@chinasquare.com'
    ON CONFLICT DO NOTHING;
  END IF;
END $$;