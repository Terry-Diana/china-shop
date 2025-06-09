export interface Admin {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
  created_at: string;
  updated_at?: string;
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

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: string;
  status: string;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  shipping_address_line1?: string;
  shipping_address_line2?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  shipping_country?: string;
  payment_method?: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  users?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  created_at: string;
  products?: {
    name: string;
    image_url: string;
  };
}

export interface User {
  id: string;
  first_name?: string;
  last_name?: string;
  email: string;
  phone?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    averageOrderValue: number;
  };
  recentActivity: {
    orders: Order[];
    users: User[];
  };
  productPerformance: Array<{
    id: number;
    name: string;
    stock: number;
    price: number;
    revenue: number;
  }>;
  chartData: {
    salesByMonth: Array<{ month: string; sales: number }>;
    userGrowth: Array<{ month: string; users: number }>;
  };
}

export interface RealTimeStats {
  todayOrders: number;
  todayUsers: number;
  recentActivity: Array<{
    id: number;
    total: number;
    created_at: string;
    users?: {
      first_name?: string;
      last_name?: string;
    };
  }>;
}