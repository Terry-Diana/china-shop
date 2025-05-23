import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(product.isFavorite);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // In a real app, this would call an API to save to user's favorites
  };

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // In a real app, this would add the product to the cart
    console.log(`Added ${product.name} to cart`);
  };

  return (
    <motion.div
      className="group relative rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${product.id}`} className="block">
        {/* Badge for discounted items */}
        {product.discount > 0 && (
          <div className="absolute top-2 left-2 z-10 bg-accent text-white text-xs font-bold px-2 py-1 rounded">
            {product.discount}% OFF
          </div>
        )}
        
        {/* Favorite button */}
        <button
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm transition-colors ${
            isFavorite ? 'text-accent' : 'text-gray-400 hover:text-accent'
          }`}
          onClick={toggleFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart size={18} fill={isFavorite ? "#bb313e" : "none"} />
        </button>
        
        {/* Product image */}
        <div className="relative aspect-square overflow-hidden">
          <img
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
            <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
            {product.originalPrice > product.price && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${product.originalPrice.toFixed(2)}
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
            onClick={addToCart}
            className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded flex items-center justify-center text-sm font-medium transition-colors"
          >
            <ShoppingCart size={16} className="mr-2" />
            Add to Cart
          </button>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;