import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Trash2, Star } from 'lucide-react';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useFavorites } from '../hooks/useFavorites';
import { useCart } from '../contexts/CartContext';

const Wishlist = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, loading, removeFromFavorites } = useFavorites();
  const { addToCart } = useCart();

  useEffect(() => {
    document.title = 'Your Wishlist | China Square';
    window.scrollTo(0, 0);

    // Redirect to login if not authenticated
    if (!user && !loading) {
      navigate('/login', { state: { from: '/wishlist' } });
    }
  }, [user, loading, navigate]);

  const moveToCart = async (productId: number) => {
    try {
      await addToCart(productId, 1);
      await removeFromFavorites(productId);
    } catch (error) {
      console.error('Error moving item to cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">Your Wishlist</h1>

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-lg shadow-sm overflow-hidden"
              >
                <div className="relative aspect-square">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                  {item.product.discount > 0 && (
                    <div className="absolute top-2 left-2 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
                      {item.product.discount}% OFF
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <Link to={`/product/${item.product.id}`} className="block">
                    <h3 className="text-lg font-medium text-gray-900 hover:text-primary transition-colors mb-2">
                      {item.product.name}
                    </h3>
                  </Link>

                  <div className="flex items-center mb-2 text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < item.product.rating ? "currentColor" : "none"}
                        stroke={i < item.product.rating ? "none" : "currentColor"}
                        className={i < item.product.rating ? "" : "text-gray-300"}
                      />
                    ))}
                    <span className="ml-1 text-xs text-gray-500">({item.product.review_count})</span>
                  </div>

                  <div className="flex items-baseline mb-4">
                    <span className="text-lg font-bold text-gray-900">
                      Ksh {item.product.price.toFixed(2)}
                    </span>
                    {item.product.original_price && item.product.original_price > item.product.price && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        Ksh {item.product.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      fullWidth
                      icon={<ShoppingCart size={18} />}
                      onClick={() => moveToCart(item.product.id)}
                    >
                      Move to Cart
                    </Button>
                    <button
                      onClick={() => removeFromFavorites(item.product.id)}
                      className="p-2 text-gray-400 hover:text-error transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Heart size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Start adding items you love to your wishlist and save them for later.
            </p>
            <Link to="/products">
              <Button variant="primary" size="lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        )}

        {favorites.length > 0 && (
          <div className="mt-8 text-center">
            <Link to="/products">
              <Button variant="outline">
                Continue Shopping
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;