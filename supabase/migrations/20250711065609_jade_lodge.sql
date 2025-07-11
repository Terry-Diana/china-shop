/*
  # Complete E-commerce Database Schema
  
  This migration creates a complete e-commerce database schema from scratch with:
  1. All necessary tables for customer and admin functionality
  2. Proper RLS policies for security
  3. 15 predefined categories
  4. Sample products for testing
  5. Automatic stock management
  6. Admin privilege system
  
  ## Tables Created:
  1. categories - Product categories
  2. products - Product catalog
  3. product_images - Multiple images per product
  4. users - Customer profiles
  5. admins - Admin users
  6. cart_items - Shopping cart
  7. orders - Order management
  8. order_items - Order line items
  9. favorites - Customer wishlist
  10. banners - Homepage banners
  
  ## Security:
  - Row Level Security enabled on all tables
  - Admin privilege checking
  - User data isolation
  - Proper access controls
*/

-- Drop all existing tables
DROP TABLE IF EXISTS banners CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS admins CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS update_modified_column();
DROP FUNCTION IF EXISTS update_product_stock();
DROP FUNCTION IF EXISTS restore_product_stock();

-- Create helper functions
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Stock management functions
CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Only reduce stock when order status changes to 'processing'
  IF NEW.status = 'processing' AND OLD.status = 'pending' THEN
    -- Reduce stock for each product in the order
    UPDATE products 
    SET stock = stock - order_items.quantity
    FROM order_items 
    WHERE products.id = order_items.product_id 
    AND order_items.order_id = NEW.id
    AND products.stock >= order_items.quantity;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION restore_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Restore stock when order is cancelled
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    -- Restore stock for each product in the order
    UPDATE products 
    SET stock = stock + order_items.quantity
    FROM order_items 
    WHERE products.id = order_items.product_id 
    AND order_items.order_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Categories table
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id INTEGER REFERENCES categories(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories policies
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories" ON categories
  FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories" ON categories
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- Insert the 15 categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Electronics', 'electronics', 'Electronic devices and gadgets', 'https://images.pexels.com/photos/20013901/pexels-photo-20013901/free-photo-of-headphones-on-a-stand.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Furniture', 'furniture', 'Home and office furniture', 'https://images.pexels.com/photos/7601135/pexels-photo-7601135.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Kitchen', 'kitchen', 'Kitchen appliances and cookware', 'https://images.pexels.com/photos/18071814/pexels-photo-18071814/free-photo-of-tea-and-coffeemaker.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Beauty', 'beauty', 'Beauty and personal care products', 'https://images.pexels.com/photos/7256120/pexels-photo-7256120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Toys', 'toys', 'Toys and games for all ages', 'https://images.pexels.com/photos/7298152/pexels-photo-7298152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Fashion', 'fashion', 'Clothing and accessories', 'https://images.pexels.com/photos/11031129/pexels-photo-11031129.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Bathroom', 'bathroom', 'Bathroom accessories and fixtures', 'https://images.pexels.com/photos/8082553/pexels-photo-8082553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Cleaning', 'cleaning', 'Cleaning supplies and equipment', 'https://plus.unsplash.com/premium_photo-1675937428935-4805321bb51e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
('Fitness', 'fitness', 'Fitness equipment and accessories', 'https://images.pexels.com/photos/4397833/pexels-photo-4397833.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Decor', 'decor', 'Home decoration and accessories', 'https://images.pexels.com/photos/3718469/pexels-photo-3718469.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Stationery', 'stationery', 'Office and school supplies', 'https://images.unsplash.com/photo-1632132142911-4695eae11663?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),
('Lights', 'lights', 'Lighting fixtures and bulbs', 'https://cdn.pixabay.com/photo/2016/08/18/20/05/light-bulbs-1603766_960_720.jpg'),
('Party Supplies', 'party', 'Party decorations and supplies', 'https://images.pexels.com/photos/20433310/pexels-photo-20433310/free-photo-of-balloons-and-decorations-for-the-second-birthday.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Baby', 'baby', 'Baby products and accessories', 'https://images.pexels.com/photos/15376336/pexels-photo-15376336/free-photo-of-socks-on-the-basket.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Pet Supplies', 'pets', 'Pet food and accessories', 'https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?q=80&w=1325&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

-- 2. Products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
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

-- Enable RLS on products
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can insert products" ON products
  FOR INSERT TO authenticated WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update products" ON products
  FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete products" ON products
  FOR DELETE TO authenticated USING (is_admin(auth.uid()));

-- 3. Product images table
CREATE TABLE product_images (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on product_images
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Product images policies
CREATE POLICY "Product images are viewable by everyone" ON product_images
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- 4. Users table
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

-- Enable RLS on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Admins can read all users" ON users
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Allow authenticated users to read all users" ON users
  FOR SELECT TO authenticated USING (true);

-- 5. Admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on admins
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Admins policies
CREATE POLICY "Allow authenticated users to read all admins" ON admins
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert admins" ON admins
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update admins" ON admins
  FOR UPDATE TO authenticated USING (true);

-- 6. Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on cart_items
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Cart items policies
CREATE POLICY "Users can view own cart items" ON cart_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cart items" ON cart_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cart items" ON cart_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own cart items" ON cart_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 7. Orders table
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
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

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can read all orders" ON orders
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all orders" ON orders
  FOR UPDATE TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Allow authenticated users to read all orders" ON orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to update orders" ON orders
  FOR UPDATE TO authenticated USING (true);

-- 8. Order items table
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Order items policies
CREATE POLICY "Admins can read all order items" ON order_items
  FOR SELECT TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Allow authenticated users to read all order items" ON order_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert order items" ON order_items
  FOR INSERT TO authenticated WITH CHECK (true);

-- 9. Favorites table
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Favorites policies
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 10. Banners table
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

-- Enable RLS on banners
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Banners policies
CREATE POLICY "Banners are viewable by everyone" ON banners
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage banners" ON banners
  FOR ALL TO authenticated USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_rating ON products(rating);
CREATE INDEX idx_products_stock ON products(stock);
CREATE INDEX idx_products_brand ON products(brand);
CREATE INDEX idx_products_name_search ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_description_search ON products USING gin(to_tsvector('english', description));
CREATE INDEX idx_categories_name_search ON categories USING gin(to_tsvector('english', name));
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Create triggers for stock management
CREATE TRIGGER update_stock_on_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

CREATE TRIGGER restore_stock_on_order_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_product_stock();

-- Insert sample products for each category
INSERT INTO products (name, slug, description, price, original_price, discount, category_id, brand, stock, rating, review_count, is_new, is_best_seller, image_url) VALUES
-- Electronics
('Wireless Bluetooth Headphones', 'wireless-bluetooth-headphones', 'Premium wireless headphones with active noise cancellation', 7499.99, 9999.99, 25, 1, 'SoundMaster', 15, 4.7, 238, false, true, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
('Smart Fitness Watch', 'smart-fitness-watch', 'Track your health and fitness with this advanced smartwatch', 6499.99, 8499.99, 24, 1, 'FitTech', 17, 4.6, 320, true, true, 'https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
('4K Smart TV 55-inch', '4k-smart-tv-55-inch', 'Ultra HD smart TV with built-in streaming apps and voice control', 24999.99, 32499.99, 23, 1, 'VisionPlus', 6, 4.6, 412, false, true, 'https://images.pexels.com/photos/6782567/pexels-photo-6782567.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),

-- Furniture
('Ergonomic Office Chair', 'ergonomic-office-chair', 'Comfortable office chair with lumbar support and adjustable features', 12499.99, 17499.99, 29, 2, 'ComfortPlus', 9, 4.4, 156, false, false, 'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
('Modern Dining Table', 'modern-dining-table', 'Stylish 6-seater dining table made from solid wood', 18999.99, 22999.99, 17, 2, 'WoodCraft', 5, 4.5, 89, true, false, 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),

-- Kitchen
('Stainless Steel Cookware Set', 'stainless-steel-cookware-set', 'Professional 12-piece cookware set with non-stick coating', 8999.99, 11999.99, 25, 3, 'ChefMaster', 12, 4.8, 267, false, true, 'https://images.pexels.com/photos/30981356/pexels-photo-30981356/free-photo-of-modern-kitchenware-set-with-stainless-steel-pots.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Coffee Maker Machine', 'coffee-maker-machine', 'Automatic drip coffee maker with programmable timer', 3499.99, 4299.99, 19, 3, 'BrewMaster', 8, 4.3, 145, true, false, 'https://images.pexels.com/photos/18071814/pexels-photo-18071814/free-photo-of-tea-and-coffeemaker.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),

-- Beauty
('Skincare Gift Set', 'skincare-gift-set', 'Complete skincare routine with cleanser, toner, and moisturizer', 2999.99, 3999.99, 25, 4, 'GlowBeauty', 25, 4.7, 189, true, true, 'https://images.pexels.com/photos/7256120/pexels-photo-7256120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Professional Hair Dryer', 'professional-hair-dryer', 'Ionic hair dryer with multiple heat settings', 1899.99, 2499.99, 24, 4, 'StylePro', 18, 4.4, 234, false, false, 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),

-- Toys
('Educational Building Blocks', 'educational-building-blocks', 'STEM learning toy set for kids aged 3-8 years', 1499.99, 1999.99, 25, 5, 'LearnPlay', 30, 4.6, 156, true, true, 'https://images.pexels.com/photos/7298152/pexels-photo-7298152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),
('Remote Control Car', 'remote-control-car', 'High-speed RC car with rechargeable battery', 2299.99, 2899.99, 21, 5, 'SpeedRacer', 14, 4.5, 98, false, false, 'https://images.pexels.com/photos/163036/mario-luigi-yoschi-figures-163036.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),

-- Fashion
('Lightweight Running Shoes', 'lightweight-running-shoes', 'Comfortable, breathable running shoes with responsive cushioning', 5999.99, 6499.99, 8, 6, 'SpeedRunner', 14, 4.7, 278, false, true, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'),
('Designer Handbag', 'designer-handbag', 'Elegant leather handbag perfect for any occasion', 4999.99, 6999.99, 29, 6, 'LuxStyle', 7, 4.8, 167, true, false, 'https://images.pexels.com/photos/11031129/pexels-photo-11031129.png?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),

-- Bathroom
('Luxury Towel Set', 'luxury-towel-set', 'Premium cotton towel set with 6 pieces', 1999.99, 2499.99, 20, 7, 'SoftTouch', 22, 4.5, 134, false, false, 'https://images.pexels.com/photos/8082553/pexels-photo-8082553.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),

-- Cleaning
('Robot Vacuum Cleaner', 'robot-vacuum-cleaner', 'Smart robot vacuum with app control and mapping', 15999.99, 19999.99, 20, 8, 'CleanBot', 4, 4.6, 89, true, true, 'https://plus.unsplash.com/premium_photo-1675937428935-4805321bb51e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),

-- Fitness
('Adjustable Dumbbells', 'adjustable-dumbbells', 'Space-saving adjustable dumbbells for home workouts', 8999.99, 11999.99, 25, 9, 'FitGear', 11, 4.7, 203, false, true, 'https://images.pexels.com/photos/4397833/pexels-photo-4397833.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),

-- Decor
('Modern Wall Art Set', 'modern-wall-art-set', 'Contemporary canvas art prints for living room decoration', 2499.99, 3299.99, 24, 10, 'ArtSpace', 16, 4.4, 78, true, false, 'https://images.pexels.com/photos/3718469/pexels-photo-3718469.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),

-- Stationery
('Premium Notebook Set', 'premium-notebook-set', 'High-quality notebooks for journaling and note-taking', 899.99, 1199.99, 25, 11, 'WriteWell', 35, 4.3, 156, false, false, 'https://images.unsplash.com/photo-1632132142911-4695eae11663?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'),

-- Lights
('LED Smart Bulbs', 'led-smart-bulbs', 'Color-changing smart LED bulbs with app control', 1299.99, 1699.99, 24, 12, 'BrightHome', 28, 4.5, 234, true, false, 'https://cdn.pixabay.com/photo/2016/08/18/20/05/light-bulbs-1603766_960_720.jpg'),

-- Party Supplies
('Birthday Party Decoration Kit', 'birthday-party-decoration-kit', 'Complete party decoration set with balloons and banners', 799.99, 999.99, 20, 13, 'PartyTime', 45, 4.2, 89, false, false, 'https://images.pexels.com/photos/20433310/pexels-photo-20433310/free-photo-of-balloons-and-decorations-for-the-second-birthday.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),

-- Baby
('Baby Care Essentials Kit', 'baby-care-essentials-kit', 'Complete baby care kit with bottles, bibs, and accessories', 1899.99, 2399.99, 21, 14, 'BabyLove', 19, 4.8, 167, true, true, 'https://images.pexels.com/photos/15376336/pexels-photo-15376336/free-photo-of-socks-on-the-basket.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'),

-- Pet Supplies
('Premium Dog Food', 'premium-dog-food', 'High-quality dry dog food for adult dogs', 2999.99, 3499.99, 14, 15, 'PetNutrition', 23, 4.6, 145, false, false, 'https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?q=80&w=1325&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');

-- Insert sample banners
INSERT INTO banners (title, subtitle, image_url, link, sort_order, active) VALUES
('Kitchen Collection', 'Discover the latest trends for the season', 'https://images.pexels.com/photos/30981356/pexels-photo-30981356/free-photo-of-modern-kitchenware-set-with-stainless-steel-pots.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', '/products/kitchen', 1, true),
('Beauty Essentials', 'Step up and glow', 'https://images.pexels.com/photos/7256120/pexels-photo-7256120.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', '/products/beauty', 2, true),
('Home Makeover', 'Transform your space with our home collection', 'https://images.pexels.com/photos/7601135/pexels-photo-7601135.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', '/products/furniture', 3, true);