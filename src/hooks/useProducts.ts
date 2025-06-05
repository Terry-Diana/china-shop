import { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Product } from '../types/admin';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await adminService.getProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const newProduct = await adminService.createProduct(product);
      setProducts([newProduct, ...products]);
      return newProduct;
    } catch (err) {
      throw err;
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      const updatedProduct = await adminService.updateProduct(id, updates);
      setProducts(products.map(p => p.id === id ? updatedProduct : p));
      return updatedProduct;
    } catch (err) {
      throw err;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await adminService.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const uploadImage = async (file: File) => {
    try {
      return await adminService.uploadProductImage(file);
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadImage,
    refetch: fetchProducts,
  };
};