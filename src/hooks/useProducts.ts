import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  discount: number;
  category_id: number | null;
  brand: string;
  stock: number;
  rating: number;
  review_count: number;
  is_new: boolean;
  is_best_seller: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
  // Computed properties for compatibility
  category: string;
  originalPrice: number;
  isNew: boolean;
  bestSeller: boolean;
  image: string;
  reviewCount: number;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false); // Start with false
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories(name)
        `)
        .order('created_at', { ascending: false });

      if (productsError) throw productsError;

      // Transform data to match expected format
      const transformedProducts = (productsData || []).map(product => ({
        ...product,
        category: product.categories?.name || 'Uncategorized',
        originalPrice: product.original_price || product.price,
        isNew: product.is_new,
        bestSeller: product.is_best_seller,
        image: product.image_url,
        reviewCount: product.review_count,
      }));

      setProducts(transformedProducts);
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('products-realtime')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'products' 
      }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
  };
};