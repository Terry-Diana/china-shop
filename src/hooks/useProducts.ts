import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product'; // Import the unified Product type

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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

      // Transform data to match the unified Product type
      const transformedProducts: Product[] = (productsData || []).map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        fullDescription: product.description, // Use description as fallback
        price: product.price,
        originalPrice: product.original_price || product.price,
        discount: product.discount,
        image: product.image_url,
        images: [product.image_url], // Create array with single image
        category: product.categories?.name || 'Uncategorized',
        brand: product.brand,
        rating: product.rating,
        reviewCount: product.review_count,
        stock: product.stock,
        isFavorite: false, // Default value
        isNew: product.is_new,
        bestSeller: product.is_best_seller,
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