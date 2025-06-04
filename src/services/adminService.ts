import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  async updateBanner(id: string, updates: any) {
    const { data, error } = await supabase
      .from('banners')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data;
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