import { motion } from 'framer-motion';
import { Clock, X } from 'lucide-react';
import { useRecentlyViewed } from '../../hooks/useRecentlyViewed';
import ProductCard from '../product/ProductCard';

const RecentlyViewed = () => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div className="py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Clock size={20} className="text-gray-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Recently Viewed</h2>
          </div>
          <button
            onClick={clearRecentlyViewed}
            className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
          >
            <X size={16} className="mr-1" />
            Clear All
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="flex space-x-4 pb-4">
            {recentlyViewed.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-64"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewed;