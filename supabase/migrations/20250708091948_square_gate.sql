/*
  # Fix admin product management and stock updates

  1. Security Updates
    - Add admin policies for products table
    - Allow admins to insert, update, and delete products
    - Add stock update triggers for order processing

  2. Stock Management
    - Create function to update product stock when orders are placed
    - Add trigger to automatically update stock on order completion

  3. Admin Permissions
    - Ensure admins can manage all product operations
    - Add proper RLS policies for admin operations
*/

-- First, let's create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add admin policies for products table
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

-- Create function to update product stock when order is placed
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

-- Create trigger to automatically update stock when order status changes
DROP TRIGGER IF EXISTS update_stock_on_order_status_change ON orders;
CREATE TRIGGER update_stock_on_order_status_change
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- Create function to restore stock when order is cancelled
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

-- Create trigger to restore stock on cancellation
DROP TRIGGER IF EXISTS restore_stock_on_order_cancel ON orders;
CREATE TRIGGER restore_stock_on_order_cancel
  AFTER UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION restore_product_stock();

-- Add admin policies for categories table
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

-- Add admin policies for orders table (for order management)
CREATE POLICY "Admins can read all orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Add admin policies for order_items table
CREATE POLICY "Admins can read all order items"
  ON order_items
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Add admin policies for users table (for user management)
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

-- Ensure the update_modified_column function exists
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;