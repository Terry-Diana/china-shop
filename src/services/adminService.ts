import { supabase } from '../lib/supabase';
import { Product, Banner, Admin } from '../types/admin';

export const adminService = {
  // Authentication - enhanced with better error handling
  async adminLogin(email: string, password: string) {
    try {
      console.log('🔐 adminService: Login attempt for:', email);
      
      // Check for default super admin credentials
      if (email.trim() === 'superadmin@chinasquare.com' && password === 'adminsuper@123') {
        console.log('✅ adminService: Default super admin credentials verified');
        
        const defaultAdmin: Admin = {
          id: 'default-super-admin',
          email: 'superadmin@chinasquare.com',
          name: 'Super Admin',
          role: 'super_admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        return { user: null, admin: defaultAdmin };
      }
      
      // For database-stored admins
      console.log('🔍 adminService: Attempting database admin authentication');
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });
      
      if (error) {
        console.error('❌ adminService: Supabase auth error:', error);
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password');
        }
        throw error;
      }
      
      if (!data.user) {
        throw new Error('Authentication failed - no user data');
      }

      console.log('✅ adminService: Auth successful, verifying admin status');
      
      // Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (adminError) {
        console.error('❌ adminService: Admin lookup error:', adminError);
        await supabase.auth.signOut();
        
        if (adminError.code === 'PGRST116') {
          throw new Error('Access denied. This account does not have admin privileges.');
        }
        throw new Error('Error verifying admin status. Please try again.');
      }
      
      if (!adminData) {
        await supabase.auth.signOut();
        throw new Error('Access denied. This account does not have admin privileges.');
      }
      
      console.log('✅ adminService: Admin verification successful');
      return { user: data.user, admin: adminData };
      
    } catch (error) {
      console.error('💥 adminService: Login error:', error);
      throw error;
    }
  },

  async registerAdmin(email: string, password: string, name: string, role: 'admin' | 'super_admin') {
    try {
      console.log('👤 adminService: Registering admin:', email, role);
      
      // Validate inputs
      if (!email.trim() || !password || !name.trim()) {
        throw new Error('All fields are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      
      // Create auth user with email confirmation disabled using admin API
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: email.trim(),
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: { 
          name: name.trim(),
          role: role
        }
      });

      if (authError) {
        console.error('❌ adminService: Auth signup error:', authError);
        if (authError.message.includes('User already registered')) {
          throw new Error('An account with this email already exists.');
        }
        if (authError.message.includes('Password should be at least')) {
          throw new Error('Password must be at least 6 characters long.');
        }
        throw new Error(`Failed to create user account: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('User creation failed - no user data returned');
      }

      console.log('✅ adminService: Auth user created, creating admin record');

      // Create admin record
      const { data: adminData, error: adminError } = await supabase
        .from('admins')
        .insert({
          id: authData.user.id,
          email: email.trim(),
          name: name.trim(),
          role: role,
        })
        .select()
        .single();

      if (adminError) {
        console.error('❌ adminService: Admin record creation error:', adminError);
        
        // Clean up auth user if admin record creation fails
        try {
          await supabase.auth.admin.deleteUser(authData.user.id);
          console.log('🧹 adminService: Cleaned up auth user after admin record failure');
        } catch (cleanupError) {
          console.error('💥 adminService: Failed to cleanup auth user:', cleanupError);
        }
        
        if (adminError.code === '23505') {
          throw new Error('An admin with this email already exists.');
        }
        throw new Error(`Failed to create admin record: ${adminError.message}`);
      }
      
      console.log('✅ adminService: Admin registration successful');
      return adminData;
      
    } catch (error) {
      console.error('💥 adminService: Registration error:', error);
      throw error;
    }
  },

  // Products
  async getProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async createProduct(product: Omit<Product, 'id'>) {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateProduct(id: number, updates: Partial<Product>) {
    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteProduct(id: number) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async uploadProductImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Inventory
  async updateStock(productId: number, quantity: number) {
    const { data, error } = await supabase
      .from('products')
      .update({ stock: quantity })
      .eq('id', productId)
      .select();

    if (error) throw error;
    return data;
  },

  async getInventoryStats() {
    const { data: products, error } = await supabase
      .from('products')
      .select('stock, price');

    if (error) throw error;

    const totalProducts = products.length;
    const lowStockItems = products.filter(p => p.stock <= 10 && p.stock > 0).length;
    const outOfStockItems = products.filter(p => p.stock === 0).length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);

    return {
      totalProducts,
      lowStockItems,
      outOfStockItems,
      totalValue,
    };
  },

  // Banners/CMS
  async getBanners() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async createBanner(banner: Omit<Banner, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('banners')
      .insert(banner)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateBanner(id: string, updates: Partial<Banner>) {
    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBanner(id: string) {
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async uploadBannerImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `banners/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('banner-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('banner-images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  // Analytics
  async getAnalytics() {
    try {
      const [
        { data: orders },
        { data: users },
        { data: products },
        { data: cartItems },
        { data: favorites }
      ] = await Promise.all([
        supabase.from('orders').select('*'),
        supabase.from('users').select('*'),
        supabase.from('products').select('*'),
        supabase.from('cart_items').select('*'),
        supabase.from('favorites').select('*'),
      ]);

      // Calculate metrics
      const totalRevenue = orders?.reduce((sum, order) => sum + order.total, 0) || 0;
      const totalOrders = orders?.length || 0;
      const totalUsers = users?.length || 0;
      const totalProducts = products?.length || 0;
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Recent activity
      const recentOrders = orders?.slice(-10) || [];
      const recentUsers = users?.slice(-10) || [];

      // Product performance
      const productPerformance = products?.map(product => ({
        id: product.id,
        name: product.name,
        stock: product.stock,
        price: product.price,
        revenue: 0, // Would need order_items data
      })) || [];

      return {
        overview: {
          totalRevenue,
          totalOrders,
          totalUsers,
          totalProducts,
          averageOrderValue,
        },
        recentActivity: {
          orders: recentOrders,
          users: recentUsers,
        },
        productPerformance,
        chartData: {
          salesByMonth: [], // Would need to aggregate by month
          userGrowth: [], // Would need to aggregate by month
        }
      };
    } catch (error) {
      console.error('Analytics error:', error);
      throw error;
    }
  },

  async getRealTimeStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { count: todayOrders },
        { count: todayUsers },
        { data: recentActivity }
      ] = await Promise.all([
        supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today),
        supabase
          .from('users')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today),
        supabase
          .from('orders')
          .select('id, total, created_at, users(first_name, last_name)')
          .order('created_at', { ascending: false })
          .limit(5)
      ]);

      return {
        todayOrders: todayOrders || 0,
        todayUsers: todayUsers || 0,
        recentActivity: recentActivity || [],
      };
    } catch (error) {
      console.error('Real-time stats error:', error);
      throw error;
    }
  },

  // Orders
  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        users(first_name, last_name, email),
        order_items(*, products(name, image_url))
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async updateOrderStatus(orderId: number, status: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Users
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) throw error;
    return data;
  },

  async createCategory(category: { name: string; slug: string; description?: string }) {
    const { data, error } = await supabase
      .from('categories')
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Import/Export
  async importProducts(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await supabase.storage
      .from('imports')
      .upload(`products/${Date.now()}-${file.name}`, file);

    if (error) throw error;
    return data;
  },

  async exportProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) throw error;

    // Convert to CSV
    const headers = Object.keys(data[0] || {});
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    return csvContent;
  },
};