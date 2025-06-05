import { supabase } from '../lib/supabase';
import { Product, Banner } from '../types/admin';

export const adminService = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  async registerAdmin(email: string, password: string, name: string, role: 'admin' | 'super_admin') {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role,
          name,
        },
      },
    });
    if (error) throw error;
    return data;
  },

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

  async importProducts(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const { data, error } = await supabase.storage
      .from('products')
      .upload(`imports/${Date.now()}-${file.name}`, file);

    if (error) throw error;
    return data;
  },

  async updateStock(productId: number, quantity: number) {
    const { data, error } = await supabase
      .from('products')
      .update({ stock: quantity })
      .eq('id', productId)
      .select();

    if (error) throw error;
    return data;
  },

  async getBanners() {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async updateBanner(id: string, updates: Partial<Banner>) {
    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
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

  async getAnalytics() {
    const [sales, users, products] = await Promise.all([
      supabase.from('orders').select('*'),
      supabase.from('users').select('*'),
      supabase.from('products').select('*'),
    ]);

    return {
      sales: sales.data,
      users: users.data,
      products: products.data,
    };
  },
};