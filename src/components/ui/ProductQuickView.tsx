import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Heart, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Product } from '../../types/product';
import Button from './Button';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../hooks/useFavorites';

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
}

const ProductQuickView = ({ product, onClose }: ProductQuickViewProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites();

  const handleAddToCart = async () => {
    if (!user) return;
    try {
      await addToCart(product.id, quantity);
      onClose();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!user) return;
    try {
      if (isFavorite(product.id)) {
        await removeFromFavorites(product.id);
      } else {
        await addToFavorites(product.id);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const images = product.images || [product.image];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-xl font-semibold">Quick View</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6 overflow-auto max-h-[calc(90vh-120px)]">
            {/* Product Images */}
            <div>
              <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {images.length > 1 && (
                <div className="flex space-x-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`w-16 h-16 rounded border-2 overflow-hidden ${
                        selectedImage === index ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                
                <div className="flex items-center mb-2">
                  <div className="flex text-yellow-400 mr-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < product.rating ? "currentColor" : "none"}
                        stroke={i < product.rating ? "none" : "currentColor"}
                        className={i < product.rating ? "" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.rating.toFixed(1)} ({product.reviewCount} reviews)
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    Ksh {product.price.toFixed(2)}
                  </span>
                  {product.originalPrice > product.price && (
                    <span className="ml-2 text-lg text-gray-500 line-through">
                      Ksh {product.originalPrice.toFixed(2)}
                    </span>
                  )}
                </div>
                {product.discount > 0 && (
                  <span className="text-sm text-accent-dark font-medium">
                    You save Ksh {(product.originalPrice - product.price).toFixed(2)} ({product.discount}%)
                  </span>
                )}
              </div>

              <p className="text-gray-600 mb-6">{product.description}</p>

              <div className="flex items-center mb-6">
                <span className="text-sm font-medium text-gray-700 mr-4">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    className="w-12 text-center border-none focus:ring-0"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    className="px-3 py-2 text-gray-600 hover:bg-gray-100"
                    disabled={quantity >= 10}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ShoppingCart size={18} />}
                  onClick={handleAddToCart}
                  disabled={!user || product.stock === 0}
                  className="flex-grow"
                >
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                
                <button
                  onClick={handleToggleFavorite}
                  disabled={!user}
                  className={`p-3 rounded-md border transition-colors ${
                    isFavorite(product.id) 
                      ? 'border-accent text-accent' 
                      : 'border-gray-300 text-gray-500 hover:border-gray-400'
                  }`}
                >
                  <Heart size={20} fill={isFavorite(product.id) ? "#bb313e" : "none"} />
                </button>
              </div>

              {!user && (
                <p className="text-sm text-gray-500 mt-2">
                  Please log in to add items to cart or wishlist
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductQuickView;