import { useState, useEffect } from 'react';
import { Product } from '../types/product';

const STORAGE_KEY = 'productComparison';
const MAX_ITEMS = 4;

export const useProductComparison = () => {
  const [comparisonList, setComparisonList] = useState<Product[]>([]);
  const [showComparisonPrompt, setShowComparisonPrompt] = useState(false);
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setComparisonList(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing comparison list:', error);
      }
    }
  }, []);

  const addToComparison = (product: Product) => {
    setComparisonList(prev => {
      if (prev.find(p => p.id === product.id)) {
        return prev; // Already in comparison
      }
      
      if (prev.length >= MAX_ITEMS) {
        return prev; // Max items reached
      }
      
      const updated = [...prev, product];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      
      // Show prompt if this is the first item
      if (prev.length === 0) {
        setPendingProduct(product);
        setShowComparisonPrompt(true);
      }
      
      return updated;
    });
  };

  const removeFromComparison = (productId: number) => {
    setComparisonList(prev => {
      const updated = prev.filter(p => p.id !== productId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearComparison = () => {
    setComparisonList([]);
    localStorage.removeItem(STORAGE_KEY);
    setShowComparisonPrompt(false);
    setPendingProduct(null);
  };

  const isInComparison = (productId: number) => {
    return comparisonList.some(p => p.id === productId);
  };

  const dismissPrompt = () => {
    setShowComparisonPrompt(false);
    setPendingProduct(null);
  };

  return {
    comparisonList,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore: comparisonList.length < MAX_ITEMS,
    showComparisonPrompt,
    pendingProduct,
    dismissPrompt,
  };
};