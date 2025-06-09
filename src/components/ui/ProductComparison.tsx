import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Check, Minus } from 'lucide-react';
import { Product } from '../../types/product';
import Button from './Button';

interface ProductComparisonProps {
  products: Product[];
  onClose: () => void;
  onRemoveProduct: (productId: number) => void;
}

const ProductComparison = ({ products, onClose, onRemoveProduct }: ProductComparisonProps) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  const features = [
    { key: 'price', label: 'Price', type: 'currency' },
    { key: 'rating', label: 'Rating', type: 'rating' },
    { key: 'reviewCount', label: 'Reviews', type: 'number' },
    { key: 'brand', label: 'Brand', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'stock', label: 'In Stock', type: 'boolean' },
    { key: 'discount', label: 'Discount', type: 'percentage' },
  ];

  const renderFeatureValue = (product: Product, feature: any) => {
    const value = product[feature.key as keyof Product];
    
    switch (feature.type) {
      case 'currency':
        return `Ksh ${(value as number).toFixed(2)}`;
      case 'rating':
        return (
          <div className="flex items-center">
            <div className="flex text-yellow-400 mr-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  fill={i < (value as number) ? "currentColor" : "none"}
                  stroke={i < (value as number) ? "none" : "currentColor"}
                  className={i < (value as number) ? "" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-sm">{(value as number).toFixed(1)}</span>
          </div>
        );
      case 'number':
        return (value as number).toLocaleString();
      case 'boolean':
        return (value as number) > 0 ? (
          <Check size={16} className="text-success" />
        ) : (
          <Minus size={16} className="text-error" />
        );
      case 'percentage':
        return `${value}%`;
      default:
        return value as string;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        >
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold">Product Comparison</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={24} />
            </button>
          </div>

          <div className="overflow-auto max-h-[calc(90vh-120px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={() => onRemoveProduct(product.id)}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-4">{product.name}</h3>
                    
                    <div className="space-y-3">
                      {features.map((feature) => (
                        <div
                          key={feature.key}
                          className={`flex justify-between items-center py-2 px-3 rounded ${
                            selectedFeature === feature.key ? 'bg-primary-50' : 'hover:bg-gray-50'
                          }`}
                          onMouseEnter={() => setSelectedFeature(feature.key)}
                          onMouseLeave={() => setSelectedFeature(null)}
                        >
                          <span className="text-sm font-medium text-gray-600">
                            {feature.label}
                          </span>
                          <span className="text-sm font-semibold">
                            {renderFeatureValue(product, feature)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <Button variant="primary" size="sm" fullWidth>
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductComparison;