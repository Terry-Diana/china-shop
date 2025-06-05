import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFavorites = async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (productId: number) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const { data, error } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          product_id: productId,
        })
        .select()
        .single();

      if (error) throw error;
      await fetchFavorites();
      return data;
    } catch (error) {
      throw error;
    }
  };

  const removeFromFavorites = async (productId: number) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;
      await fetchFavorites();
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('favorite_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchFavorites();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite: (productId: number) => favorites.some(f => f.product_id === productId),
  };
};