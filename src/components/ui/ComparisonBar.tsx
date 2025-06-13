import { useState } from 'react';
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
    dismissPrompt 
  } = useProductComparison();
  const [showComparison, setShowComparison] = useState(false);

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
    </>
  );
};

export default ComparisonBar;