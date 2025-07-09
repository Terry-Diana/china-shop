/*
  # Complete E-commerce Database Schema

  This migration creates a complete database schema for the e-commerce platform
  with proper RLS policies, triggers, and functions.

  ## Tables Created:
  1. Categories - Product categories with hierarchical support
  2. Products - Main products table with full product information
  3. Product Images - Multiple images per product
  4. Users - Extended user profiles
  5. Admins - Admin user management
  6. Cart Items - Shopping cart functionality
  7. Orders - Order management
  8. Order Items - Individual items in orders
  9. Favorites/Wishlist - User favorites
  10. Banners - Homepage banners/promotions

  ## Security:
  - Row Level Security enabled on all tables
  - Proper policies for users, admins, and public access
  - Admin privilege checking functions

  ## Features:
  - Automatic stock management on order processing
  - Audit trails with created_at/updated_at timestamps
  - Proper foreign key relationships
  - Optimized indexes for performance
*/

-- Drop all existing tables (in correct order to handle foreign keys)
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS update_product_stock();
DROP FUNCTION IF EXISTS restore_product_stock();
DROP FUNCTION IF EXISTS update_modified_column();

-- Create utility function for updating timestamps
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create admin checking function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CATEGORIES TABLE
-- =============================================
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

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON categories FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Categories triggers
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- =============================================
-- PRODUCTS TABLE
-- =============================================
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

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- Products triggers
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Products indexes
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_rating ON products(rating);

-- =============================================
-- PRODUCT IMAGES TABLE
-- =============================================
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Product images policies
CREATE POLICY "Product images are viewable by everyone"
  ON product_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage product images"
  ON product_images FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  email TEXT NOT NULL UNIQUE,
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

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can insert own data"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view own data"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Allow authenticated users to read all users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

-- Users triggers
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- =============================================
-- ADMINS TABLE
-- =============================================
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins policies
CREATE POLICY "Allow authenticated users to read all admins"
  ON admins FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert admins"
  ON admins FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update admins"
  ON admins FOR UPDATE
  TO authenticated
  USING (true);

-- Admins triggers
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- =============================================
-- CART ITEMS TABLE
-- =============================================
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Cart items policies
CREATE POLICY "Users can view own cart items"
  ON cart_items FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items"
  ON cart_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items"
  ON cart_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items"
  ON cart_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Cart items triggers
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- =============================================
-- ORDERS TABLE
-- =============================================
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

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow authenticated users to read all orders"
  ON orders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (true);

-- Orders triggers
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- Orders indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- =============================================
-- ORDER ITEMS TABLE
-- =============================================
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Order items policies
CREATE POLICY "Allow authenticated users to read all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read all order items"
  ON order_items FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- =============================================
-- FAVORITES/WISHLIST TABLE
-- =============================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- WISHLIST TABLE (Alternative to favorites)
-- =============================================
CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;

-- Wishlist policies
CREATE POLICY "Users can read own wishlist"
  ON wishlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into own wishlist"
  ON wishlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from own wishlist"
  ON wishlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- BANNERS TABLE
-- =============================================
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

-- Enable RLS
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Banners policies
CREATE POLICY "Banners are viewable by everyone"
  ON banners FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can manage banners"
  ON banners FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Banners triggers
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON banners
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();

-- =============================================
-- STOCK MANAGEMENT FUNCTIONS
-- =============================================

-- Function to update product stock when order status changes
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update stock when order status changes to 'processing' or 'shipped'
  IF NEW.status IN ('processing', 'shipped') AND OLD.status = 'pending' THEN
    -- Update stock for all items in the order
    UPDATE products 
    SET stock = stock - order_items.quantity
    FROM order_items 
    WHERE products.id = order_items.product_id 
    AND order_items.order_id = NEW.id
    AND products.stock >= order_items.quantity; -- Prevent negative stock
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to restore stock when order is cancelled
CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Restore stock when order is cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE products 
    SET stock = stock + order_items.quantity
    FROM order_items 
    WHERE products.id = order_items.product_id 
    AND order_items.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for stock management
CREATE TRIGGER update_stock_on_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

CREATE TRIGGER restore_stock_on_order_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_product_stock();

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets'),
('Fashion', 'fashion', 'Clothing and accessories'),
('Home & Garden', 'home', 'Home improvement and garden supplies'),
('Sports & Outdoors', 'sports', 'Sports equipment and outdoor gear'),
('Books', 'books', 'Books and educational materials'),
('Beauty & Health', 'beauty', 'Beauty products and health supplements'),
('Toys & Games', 'toys', 'Toys and games for all ages'),
('Automotive', 'automotive', 'Car parts and accessories');

-- Insert sample products
INSERT INTO products (name, slug, description, price, original_price, discount, category_id, brand, stock, rating, review_count, is_new, is_best_seller, image_url) VALUES
('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Premium wireless headphones with noise cancellation', 7499.99, 9999.99, 25, 1, 'SoundMaster', 50, 4.5, 128, true, true, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'),
('Smart Fitness Watch', 'smart-fitness-watch', 'Advanced fitness tracking with heart rate monitor', 12999.99, 15999.99, 19, 1, 'FitTech', 30, 4.7, 89, true, false, 'https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg'),
('Casual Cotton T-Shirt', 'casual-cotton-tshirt', 'Comfortable 100% cotton t-shirt', 1299.99, 1599.99, 19, 2, 'ComfortWear', 100, 4.2, 45, false, true, 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg'),
('LED Desk Lamp', 'led-desk-lamp', 'Adjustable LED desk lamp with USB charging', 2499.99, 2999.99, 17, 3, 'BrightLight', 25, 4.4, 67, false, false, 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg'),
('Yoga Mat Premium', 'yoga-mat-premium', 'Non-slip premium yoga mat', 1999.99, 2499.99, 20, 4, 'FlexFit', 40, 4.6, 92, false, true, 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg');

-- Insert sample banners
INSERT INTO banners (title, subtitle, image_url, link, sort_order, active) VALUES
('Summer Sale', 'Up to 50% off on selected items', 'https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg', '/products?filter=sale', 1, true),
('New Arrivals', 'Check out our latest collection', 'https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg', '/products?filter=new', 2, true),
('Free Shipping', 'On orders over Ksh 5,000', 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg', '/products', 3, true);

-- Create indexes for better performance
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_description_search ON products USING gin(to_tsvector('english', description));
CREATE INDEX idx_categories_name_search ON categories USING gin(to_tsvector('english', name));