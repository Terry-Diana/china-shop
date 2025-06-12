import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Edit2, Package, DollarSign } from 'lucide-react';
import Button from '../ui/Button';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number | null;
  discount: number;
  brand: string;
  stock: number;
  rating: number;
  review_count: number;
  is_new: boolean;
  is_best_seller: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface ProductQuickViewProps {
  product: Product;
  onClose: () => void;
  onEdit: (product: Product) => void;
}

const ProductQuickView = ({ product, onClose, onEdit }: ProductQuickViewProps) => {
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
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Product Details</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Product Image */}
              <div>
                <div className="aspect-square mb-4 rounded-lg overflow-hidden">
                  <img
                    src={product.image_url || 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg';
                    }}
                  />
                </div>
                
                {/* Status Badges */}
                <div className="flex gap-2">
                  {product.is_new && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                      New
                    </span>
                  )}
                  {product.is_best_seller && (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                      Best Seller
                    </span>
                  )}
                  {product.discount > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                      {product.discount}% OFF
                    </span>
                  )}
                </div>
              </div>

              {/* Product Details */}
              <div>
                <div className="mb-4">
                  <h1 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-sm text-gray-600 mb-2">Brand: {product.brand}</p>
                  
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
                      {product.rating.toFixed(1)} ({product.review_count} reviews)
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      Ksh {product.price.toFixed(2)}
                    </span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="ml-2 text-lg text-gray-500 line-through">
                        Ksh {product.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.discount > 0 && (
                    <span className="text-sm text-red-600 font-medium">
                      You save Ksh {((product.original_price || 0) - product.price).toFixed(2)} ({product.discount}%)
                    </span>
                  )}
                </div>

                <p className="text-gray-600 mb-6">{product.description}</p>

                {/* Stock Status */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <Package size={18} className="mr-2 text-gray-600" />
                    <span className="font-medium">Stock Status</span>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      product.stock > 10 ? 'bg-green-500' : 
                      product.stock > 0 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`text-sm font-medium ${
                      product.stock > 10 ? 'text-green-600' : 
                      product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {product.stock > 10 ? 'In Stock' : 
                       product.stock > 0 ? `Low Stock (${product.stock} left)` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">SKU:</span>
                    <span className="font-medium">#{product.id.toString().padStart(6, '0')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">{new Date(product.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{new Date(product.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    icon={<Edit2 size={18} />}
                    onClick={() => onEdit(product)}
                    className="flex-grow"
                  >
                    Edit Product
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductQuickView;