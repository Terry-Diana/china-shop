// src/components/product/ProductCard.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Eye, BarChart3 } from 'lucide-react';
import { Product } from '../../types/product';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext'; // ✅ Import from context, not hooks
import { useFavorites } from '../../hooks/useFavorites';
import { useProductComparison } from '../../hooks/useProductComparison';
import { useAnalytics } from '../../hooks/useAnalytics';
import LazyImage from '../ui/LazyImage';
import ProductQuickView from '../ui/ProductQuickView';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cartButtonState, setCartButtonState] = useState<'default' | 'adding' | 'added'>('default');
  const [favoriteButtonState, setFavoriteButtonState] = useState<'default' | 'adding'>('default');
  const [showQuickView, setShowQuickView] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart(); // ✅ This should now work correctly
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();
  const { addToComparison, isInComparison, canAddMore } = useProductComparison();
  const { trackProductView, trackAddToCart, trackAddToWishlist } = useAnalytics();

  const handleProductClick = () => {
    trackProductView(product.id, product.name);
  };

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (favoriteButtonState === 'adding') return;

    setFavoriteButtonState('adding');

    try {
      if (isFavorite(product.id)) {
        await removeFromFavorites(product.id);
      } else {
        await addToFavorites(product.id);
        trackAddToWishlist(product.id, product.name);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    } finally {
      setFavoriteButtonState('default');
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (product.stock === 0 || cartButtonState !== 'default') {
      return;
    }

    setCartButtonState('adding');

    try {
      await addToCart(product.id, 1);
      trackAddToCart(product.id, product.name, 1, product.price);
      
      // Show "Added to Cart" state
      setCartButtonState('added');
      
      // Reset to default after 2 seconds
      setTimeout(() => {
        setCartButtonState('default');
      }, 2000);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setCartButtonState('default');
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
    trackProductView(product.id, product.name);
  };

  const handleAddToComparison = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canAddMore && !isInComparison(product.id)) {
      addToComparison(product);
    }
  };

  const getCartButtonText = () => {
    if (product.stock === 0) return 'Out of Stock';
    if (cartButtonState === 'adding') return 'Adding...';
    if (cartButtonState === 'added') return 'Added to Cart';
    return 'Add to Cart';
  };

  const getCartButtonClass = () => {
    if (product.stock === 0) return 'bg-gray-400 cursor-not-allowed';
    if (cartButtonState === 'added') return 'bg-success hover:bg-success-dark';
    if (cartButtonState === 'adding') return 'bg-primary opacity-75 cursor-wait';
    return 'bg-primary hover:bg-primary-dark';
  };

  return (
    <>
      <motion.div
        className="group relative rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link to={`/product/${product.id}`} className="block" onClick={handleProductClick}>
          {/* Badge for discounted items */}
          {product.discount > 0 && (
            <div className="absolute top-2 left-2 z-10 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
              {product.discount}% OFF
            </div>
          )}
          
          {/* Action buttons */}
          <div className="absolute top-2 right-2 z-10 flex flex-col space-y-1">
            <button
              className={`p-1.5 rounded-full bg-white/80 backdrop-blur-sm transition-all duration-200 ${
                favoriteButtonState === 'adding' ? 'opacity-75 cursor-wait' : ''
              } ${
                isFavorite(product.id) ? 'text-accent' : 'text-gray-400 hover:text-accent'
              }`}
              onClick={handleFavoriteClick}
              disabled={favoriteButtonState === 'adding'}
              aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                size={18} 
                fill={isFavorite(product.id) ? "#bb313e" : "none"} 
              />
            </button>

            {/* Quick view button */}
            <motion.button
              className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-primary transition-colors"
              onClick={handleQuickView}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
              transition={{ duration: 0.2 }}
              aria-label="Quick view"
            >
              <Eye size={18} />
            </motion.button>

            {/* Add to comparison button */}
            {canAddMore && !isInComparison(product.id) && (
              <motion.button
                className="p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-primary transition-colors"
                onClick={handleAddToComparison}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                aria-label="Add to comparison"
              >
                <BarChart3 size={18} />
              </motion.button>
            )}
          </div>
          
          {/* Product image */}
          <div className="relative aspect-square overflow-hidden">
            <LazyImage
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Product info */}
          <div className="p-4">
            <div className="flex items-center mb-1 text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < product.rating ? "currentColor" : "none"}
                  stroke={i < product.rating ? "none" : "currentColor"}
                  className={i < product.rating ? "" : "text-gray-300"}
                />
              ))}
              <span className="ml-1 text-xs text-gray-500">({product.reviewCount})</span>
            </div>
            
            <h3 className="font-medium text-gray-900 group-hover:text-primary transition-colors line-clamp-1">
              {product.name}
            </h3>
            
            <p className="text-xs text-gray-500 mb-2 line-clamp-1">{product.category}</p>
            
            <div className="flex items-center">
              <span className="font-semibold text-gray-900">Ksh {product.price.toFixed(2)}</span>
              {product.originalPrice > product.price && (
                <span className="ml-2 text-sm text-gray-500 line-through">
                  Ksh {product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Quick-add button (appears on hover) */}
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-white p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"
            initial={{ y: "100%" }}
            animate={{ y: isHovered ? 0 : "100%" }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || cartButtonState !== 'default'}
              className={`w-full py-2 px-4 text-white rounded flex items-center justify-center text-sm font-medium transition-all duration-300 ${getCartButtonClass()}`}
            >
              <ShoppingCart size={16} className="mr-2" />
              {getCartButtonText()}
            </button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Quick View Modal */}
      {showQuickView && (
        <ProductQuickView
          product={product}
          onClose={() => setShowQuickView(false)}
        />
      )}
    </>
  );
};

export default ProductCard;