import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Plus } from 'lucide-react';
import { Product } from '../../types/product';
import Button from './Button';

interface ComparisonPromptProps {
  isVisible: boolean;
  product: Product | null;
  onDismiss: () => void;
  onAddAnother: () => void;
}

const ComparisonPrompt = ({ isVisible, product, onDismiss, onAddAnother }: ComparisonPromptProps) => {
  if (!product) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border p-4 z-50 max-w-sm"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center">
              <BarChart3 size={20} className="text-primary mr-2" />
              <h3 className="font-medium text-gray-900">Product Added to Compare</h3>
            </div>
            <button
              onClick={onDismiss}
              className="text-gray-400 hover:text-gray-500"
            >
              <X size={18} />
            </button>
          </div>
          
          <div className="flex items-center mb-4">
            <img
              src={product.image}
              alt={product.name}
              className="w-12 h-12 object-cover rounded mr-3"
            />
            <div>
              <p className="font-medium text-gray-900 text-sm">{product.name}</p>
              <p className="text-xs text-gray-500">Ksh {product.price.toFixed(2)}</p>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Add another product to start comparing features and prices.
          </p>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onDismiss}
              className="flex-1"
            >
              Continue Shopping
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus size={16} />}
              onClick={onAddAnother}
              className="flex-1"
            >
              Add Another
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ComparisonPrompt;