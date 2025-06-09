import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface CartItem {
  id: string;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url: string;
    stock: number;
  };
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Cart fetch error:', error);
        throw error;
      }
      
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number = 1) => {
    if (!user) throw new Error('Must be logged in');

    try {
      // Check if item already exists in cart
      const existingItem = items.find(item => item.product_id === productId);
      
      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        await updateQuantity(productId, newQuantity);
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: productId,
            quantity,
          })
          .select()
          .single();

        if (error) {
          console.error('Add to cart error:', error);
          throw error;
        }
        
        await fetchCart();
      }
    } catch (error) {
      console.error('Error in addToCart:', error);
      throw error;
    }
  };

  const removeFromCart = async (productId: number) => {
    if (!user) throw new Error('Must be logged in');

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Remove from cart error:', error);
        throw error;
      }
      
      await fetchCart();
    } catch (error) {
      console.error('Error in removeFromCart:', error);
      throw error;
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (!user) throw new Error('Must be logged in');

    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) {
        console.error('Update quantity error:', error);
        throw error;
      }
      
      await fetchCart();
    } catch (error) {
      console.error('Error in updateQuantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!user) throw new Error('Must be logged in');

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) {
        console.error('Clear cart error:', error);
        throw error;
      }
      
      await fetchCart();
    } catch (error) {
      console.error('Error in clearCart:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('cart_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cart_items',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCart();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};