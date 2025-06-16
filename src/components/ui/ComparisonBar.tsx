import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, X, Eye } from 'lucide-react';
import { useProductComparison } from '../../hooks/useProductComparison';
import ProductComparison from './ProductComparison';
import ComparisonPrompt from './ComparisonPrompt';
import Button from './Button';

const ComparisonBar = () => {
  const { 
    comparisonList, 
    removeFromComparison, 
    clearComparison, 
    showComparisonPrompt, 
    pendingProduct, 
    dismissPrompt,
    canAddMore
  } = useProductComparison();
  const [showComparison, setShowComparison] = useState(false);
  const [showAddMorePrompt, setShowAddMorePrompt] = useState(false);

  useEffect(() => {
    // Show "add more" prompt when first item is added
    if (comparisonList.length === 1 && !showComparisonPrompt) {
      setShowAddMorePrompt(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowAddMorePrompt(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [comparisonList.length, showComparisonPrompt]);

  const handleAddAnother = () => {
    dismissPrompt();
    // Scroll to top to help user find more products
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Comparison Bar */}
      <AnimatePresence>
        {comparisonList.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg border z-40 p-4"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <BarChart3 size={20} className="text-primary mr-2" />
                <span className="font-medium text-gray-900">
                  Compare ({comparisonList.length})
                </span>
              </div>

              <div className="flex space-x-2">
                {comparisonList.slice(0, 3).map((product) => (
                  <div key={product.id} className="relative">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded border"
                    />
                    <button
                      onClick={() => removeFromComparison(product.id)}
                      className="absolute -top-1 -right-1 bg-error text-white rounded-full w-4 h-4 flex items-center justify-center text-xs"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
                {comparisonList.length > 3 && (
                  <div className="w-10 h-10 bg-gray-100 rounded border flex items-center justify-center text-xs font-medium">
                    +{comparisonList.length - 3}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearComparison}
                >
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Eye size={16} />}
                  onClick={() => setShowComparison(true)}
                  disabled={comparisonList.length < 2}
                >
                  Compare
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      {showComparison && (
        <ProductComparison
          products={comparisonList}
          onClose={() => setShowComparison(false)}
          onRemoveProduct={removeFromComparison}
        />
      )}

      {/* Comparison Prompt */}
      <ComparisonPrompt
        isVisible={showComparisonPrompt}
        product={pendingProduct}
        onDismiss={dismissPrompt}
        onAddAnother={handleAddAnother}
      />

      {/* Add More Prompt */}
      <AnimatePresence>
        {showAddMorePrompt && comparisonList.length === 1 && canAddMore && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 right-4 bg-white rounded-lg shadow-lg border p-4 z-50 max-w-sm"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center">
                <BarChart3 size={20} className="text-primary mr-2" />
                <h3 className="font-medium text-gray-900">Add More Products</h3>
              </div>
              <button
                onClick={() => setShowAddMorePrompt(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={18} />
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Add another product to start comparing features and prices.
            </p>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddMorePrompt(false)}
                className="flex-1"
              >
                Dismiss
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowAddMorePrompt(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1"
              >
                Browse Products
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ComparisonBar;