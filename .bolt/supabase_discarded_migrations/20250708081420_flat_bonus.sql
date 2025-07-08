/*
  # Create products table with sample data

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text, product name)
      - `description` (text, product description)
      - `price` (numeric, product price)
      - `category` (text, product category)
      - `brand` (text, product brand)
      - `stock` (integer, stock quantity)
      - `rating` (numeric, product rating)
      - `is_best_seller` (boolean, best seller flag)
      - `image_url` (text, product image URL)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `products` table
    - Add policy for public read access to products
    - Add policy for authenticated users to manage products

  3. Sample Data
    - Insert sample products for testing
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  category text,
  brand text,
  stock integer NOT NULL DEFAULT 0,
  rating numeric(3,2) DEFAULT 0,
  is_best_seller boolean DEFAULT false,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Products are viewable by everyone"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products
INSERT INTO products (name, description, price, category, brand, stock, rating, is_best_seller, image_url) VALUES
('Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation', 99.99, 'Electronics', 'TechBrand', 50, 4.5, true, 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'),
('Smart Watch', 'Feature-rich smartwatch with health monitoring', 199.99, 'Electronics', 'SmartTech', 30, 4.3, false, 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg'),
('Coffee Maker', 'Automatic drip coffee maker with programmable timer', 79.99, 'Kitchen', 'BrewMaster', 25, 4.2, false, 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg'),
('Yoga Mat', 'Non-slip exercise yoga mat', 29.99, 'Sports', 'FitLife', 100, 4.4, true, 'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg'),
('LED Desk Lamp', 'Adjustable LED desk lamp with USB charging port', 45.99, 'Home', 'LightPro', 40, 4.1, false, 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg'),
('Wireless Mouse', 'Ergonomic wireless mouse with long battery life', 24.99, 'Electronics', 'TechBrand', 75, 4.0, false, 'https://images.pexels.com/photos/2115256/pexels-photo-2115256.jpeg'),
('Stainless Steel Water Bottle', 'Insulated water bottle keeps drinks cold for 24 hours', 19.99, 'Sports', 'HydroLife', 120, 4.6, true, 'https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg'),
('Bluetooth Speaker', 'Portable waterproof Bluetooth speaker', 59.99, 'Electronics', 'SoundWave', 60, 4.3, false, 'https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg'),
('Kitchen Knife Set', 'Professional 8-piece kitchen knife set with block', 89.99, 'Kitchen', 'ChefPro', 20, 4.5, false, 'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg'),
('Running Shoes', 'Lightweight running shoes with cushioned sole', 119.99, 'Sports', 'RunFast', 35, 4.4, true, 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg');