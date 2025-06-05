export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  original_price: number | null;
  discount: number;
  category_id: number;
  brand: string;
  stock: number;
  rating: number;
  review_count: number;
  is_new: boolean;
  is_best_seller: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link: string;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  sales: any[];
  users: any[];
  products: any[];
}