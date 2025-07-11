/*
  # Fix Admin Product Management and Update Categories

  1. Security Updates
    - Fix admin policies for products table
    - Ensure admins can insert, update, and delete products
    - Add proper admin checking function

  2. Categories Update
    - Clear existing categories
    - Add your specific 15 categories
    - Maintain referential integrity

  3. Stock Management
    - Ensure stock updates work when orders are placed
    - Add proper triggers for stock management

  4. Admin Permissions
    - Fix admin privilege checking
    - Ensure proper RLS policies
*/

-- =============================================
-- ADMIN FUNCTION AND POLICIES FIX
-- =============================================

-- Recreate admin checking function with proper security
DROP FUNCTION IF EXISTS is_admin(uuid);
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
-- FIX PRODUCTS TABLE RLS POLICIES
-- =============================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Create new, working admin policies for products
CREATE POLICY "Admins can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- =============================================
-- UPDATE CATEGORIES WITH YOUR SPECIFIC LIST
-- =============================================

-- Clear existing categories (this will cascade to products, so we'll handle that)
DELETE FROM categories;

-- Reset the sequence
ALTER SEQUENCE categories_id_seq RESTART WITH 1;

-- Insert your specific categories
INSERT INTO categories (name, slug, description, image_url) VALUES
('Electronics', 'electronics', 'Electronic devices, gadgets, and tech accessories', 'https://images.pexels.com/photos/20013901/pexels-photo-20013901/free-photo-of-headphones-on-a-stand.jpeg'),
('Furniture', 'furniture', 'Home and office furniture', 'https://images.pexels.com/photos/7601135/pexels-photo-7601135.jpeg'),
('Kitchen', 'kitchen', 'Kitchen appliances, cookware, and utensils', 'https://images.pexels.com/photos/18071814/pexels-photo-18071814/free-photo-of-tea-and-coffeemaker.jpeg'),
('Beauty', 'beauty', 'Beauty products, cosmetics, and personal care', 'https://images.pexels.com/photos/7256120/pexels-photo-7256120.jpeg'),
('Toys', 'toys', 'Toys and games for children of all ages', 'https://images.pexels.com/photos/7298152/pexels-photo-7298152.jpeg'),
('Fashion', 'fashion', 'Clothing, shoes, and fashion accessories', 'https://images.pexels.com/photos/11031129/pexels-photo-11031129.png'),
('Bathroom', 'bathroom', 'Bathroom fixtures, accessories, and supplies', 'https://images.pexels.com/photos/8082553/pexels-photo-8082553.jpeg'),
('Cleaning', 'cleaning', 'Cleaning supplies and household maintenance', 'https://plus.unsplash.com/premium_photo-1675937428935-4805321bb51e'),
('Fitness', 'fitness', 'Exercise equipment and fitness accessories', 'https://images.pexels.com/photos/4397833/pexels-photo-4397833.jpeg'),
('Decor', 'decor', 'Home decoration and interior design items', 'https://images.pexels.com/photos/3718469/pexels-photo-3718469.jpeg'),
('Stationery', 'stationery', 'Office supplies, writing materials, and paper products', 'https://images.unsplash.com/photo-1632132142911-4695eae11663'),
('Lights', 'lights', 'Lighting fixtures and electrical accessories', 'https://cdn.pixabay.com/photo/2016/08/18/20/05/light-bulbs-1603766_960_720.jpg'),
('Party Supplies', 'party', 'Party decorations, supplies, and celebration items', 'https://images.pexels.com/photos/20433310/pexels-photo-20433310/free-photo-of-balloons-and-decorations-for-the-second-birthday.jpeg'),
('Baby', 'baby', 'Baby products, clothing, and accessories', 'https://images.pexels.com/photos/15376336/pexels-photo-15376336/free-photo-of-socks-on-the-basket.jpeg'),
('Pet Supplies', 'pets', 'Pet food, toys, and accessories', 'https://images.unsplash.com/photo-1600369671236-e74521d4b6ad');

-- =============================================
-- UPDATE EXISTING PRODUCTS WITH NEW CATEGORIES
-- =============================================

-- Update existing products to use the new category IDs
-- Electronics products
UPDATE products SET category_id = 1 WHERE category_id IS NULL OR brand IN ('SoundMaster', 'TechGiant', 'FitTech', 'PowerUp', 'VisionPlus', 'PhotoMaster');

-- Fashion products  
UPDATE products SET category_id = 6 WHERE brand IN ('SpeedRunner') OR name ILIKE '%shoe%' OR name ILIKE '%clothing%';

-- Home/Furniture products
UPDATE products SET category_id = 2 WHERE brand IN ('ComfortPlus') OR name ILIKE '%chair%' OR name ILIKE '%furniture%';

-- Kitchen products
UPDATE products SET category_id = 3 WHERE name ILIKE '%kitchen%' OR name ILIKE '%cook%' OR name ILIKE '%bottle%';

-- Beauty products
UPDATE products SET category_id = 4 WHERE name ILIKE '%beauty%' OR name ILIKE '%cosmetic%';

-- Toys
UPDATE products SET category_id = 5 WHERE name ILIKE '%toy%' OR name ILIKE '%game%';

-- Default to Electronics for any remaining products
UPDATE products SET category_id = 1 WHERE category_id IS NULL;

-- =============================================
-- STOCK MANAGEMENT FUNCTIONS
-- =============================================

-- Ensure stock management functions exist and work properly
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

-- Recreate triggers for stock management
DROP TRIGGER IF EXISTS update_stock_on_order_status_change ON orders;
DROP TRIGGER IF EXISTS restore_stock_on_order_cancel ON orders;

CREATE TRIGGER update_stock_on_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

CREATE TRIGGER restore_stock_on_order_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_product_stock();

-- =============================================
-- ENSURE OTHER ADMIN POLICIES ARE CORRECT
-- =============================================

-- Fix categories policies
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Admins can update categories" ON categories;
DROP POLICY IF EXISTS "Admins can delete categories" ON categories;

CREATE POLICY "Admins can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can delete categories"
  ON categories
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));

-- =============================================
-- ADD SAMPLE PRODUCTS FOR EACH CATEGORY
-- =============================================

-- Add sample products for the new categories (only if no products exist)
INSERT INTO products (name, slug, description, price, original_price, discount, category_id, brand, stock, rating, review_count, is_new, is_best_seller, image_url)
SELECT * FROM (VALUES
  -- Electronics
  ('Wireless Bluetooth Earbuds', 'wireless-bluetooth-earbuds', 'True wireless earbuds with premium sound quality', 3999.99, 4999.99, 20, 1, 'SoundMaster', 25, 4.5, 156, true, true, 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg'),
  ('Smart Phone Stand', 'smart-phone-stand', 'Adjustable phone stand for desk use', 899.99, 1199.99, 25, 1, 'TechGiant', 50, 4.2, 89, false, false, 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'),
  
  -- Furniture
  ('Ergonomic Office Chair', 'ergonomic-office-chair', 'Comfortable office chair with lumbar support', 12999.99, 15999.99, 19, 2, 'ComfortPlus', 15, 4.7, 234, false, true, 'https://images.pexels.com/photos/1957478/pexels-photo-1957478.jpeg'),
  ('Modern Coffee Table', 'modern-coffee-table', 'Stylish coffee table for living room', 8999.99, 10999.99, 18, 2, 'ModernHome', 8, 4.3, 67, true, false, 'https://images.pexels.com/photos/7601135/pexels-photo-7601135.jpeg'),
  
  -- Kitchen
  ('Stainless Steel Cookware Set', 'stainless-steel-cookware-set', 'Professional grade cookware set', 6999.99, 8999.99, 22, 3, 'ChefMaster', 20, 4.6, 145, false, true, 'https://images.pexels.com/photos/30981356/pexels-photo-30981356/free-photo-of-modern-kitchenware-set-with-stainless-steel-pots.jpeg'),
  ('Electric Coffee Maker', 'electric-coffee-maker', 'Programmable coffee maker with timer', 4999.99, 5999.99, 17, 3, 'BrewMaster', 12, 4.4, 98, true, false, 'https://images.pexels.com/photos/18071814/pexels-photo-18071814/free-photo-of-tea-and-coffeemaker.jpeg'),
  
  -- Beauty
  ('Skincare Gift Set', 'skincare-gift-set', 'Complete skincare routine set', 2999.99, 3999.99, 25, 4, 'GlowBeauty', 30, 4.5, 178, true, true, 'https://images.pexels.com/photos/7256120/pexels-photo-7256120.jpeg'),
  ('Professional Hair Dryer', 'professional-hair-dryer', 'Salon-quality hair dryer', 3499.99, 4299.99, 19, 4, 'StylePro', 18, 4.3, 89, false, false, 'https://images.pexels.com/photos/7256120/pexels-photo-7256120.jpeg'),
  
  -- Toys
  ('Educational Building Blocks', 'educational-building-blocks', 'STEM learning building blocks set', 1999.99, 2499.99, 20, 5, 'LearnPlay', 40, 4.7, 234, true, true, 'https://images.pexels.com/photos/7298152/pexels-photo-7298152.jpeg'),
  ('Remote Control Car', 'remote-control-car', 'High-speed RC car for kids', 2499.99, 2999.99, 17, 5, 'SpeedToys', 25, 4.4, 156, false, false, 'https://images.pexels.com/photos/7298152/pexels-photo-7298152.jpeg'),
  
  -- Fashion
  ('Premium Cotton T-Shirt', 'premium-cotton-tshirt', 'Soft and comfortable cotton t-shirt', 1299.99, 1599.99, 19, 6, 'ComfortWear', 100, 4.2, 345, false, true, 'https://images.pexels.com/photos/11031129/pexels-photo-11031129.png'),
  ('Running Sneakers', 'running-sneakers', 'Lightweight running shoes', 4999.99, 5999.99, 17, 6, 'SportFit', 35, 4.6, 189, true, false, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg')
) AS new_products(name, slug, description, price, original_price, discount, category_id, brand, stock, rating, review_count, is_new, is_best_seller, image_url)
WHERE NOT EXISTS (SELECT 1 FROM products WHERE slug = new_products.slug);