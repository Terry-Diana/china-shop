import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { Product } from '../types/product';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchProducts: (query: string) => Promise<void>;
  filterProducts: (filters: ProductFilters) => Promise<void>;
  sortProducts: (sortBy: string) => void;
  fetchProducts: () => Promise<void>;
}

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string[];
  inStock?: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: searchError } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (searchError) throw searchError;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error searching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = async (filters: ProductFilters) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from('products').select('*');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.minPrice !== undefined) {
        query = query.gte('price', filters.minPrice);
      }

      if (filters.maxPrice !== undefined) {
        query = query.lte('price', filters.maxPrice);
      }

      if (filters.brand && filters.brand.length > 0) {
        query = query.in('brand', filters.brand);
      }

      if (filters.inStock) {
        query = query.gt('stock', 0);
      }

      const { data, error: filterError } = await query.order('created_at', { ascending: false });

      if (filterError) throw filterError;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message);
      console.error('Error filtering products:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (sortBy: string) => {
    const sortedProducts = [...products];
    switch (sortBy) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sortedProducts.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'rating':
        sortedProducts.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Default sorting by popularity (best sellers first)
        sortedProducts.sort((a, b) => (a.is_best_seller === b.is_best_seller ? 0 : a.is_best_seller ? -1 : 1));
    }
    setProducts(sortedProducts);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        searchProducts,
        filterProducts,
        sortProducts,
        fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};