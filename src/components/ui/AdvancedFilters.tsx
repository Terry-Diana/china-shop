import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, Star, Check } from 'lucide-react';
import Button from './Button';

interface FilterOptions {
  priceRange: [number, number];
  brands: string[];
  categories: string[];
  rating: number;
  inStock: boolean;
  onSale: boolean;
  sortBy: string;
}

interface AdvancedFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableBrands: string[];
  availableCategories: string[];
  onClose: () => void;
  isOpen: boolean;
}

const AdvancedFilters = ({
  filters,
  onFiltersChange,
  availableBrands,
  availableCategories,
  onClose,
  isOpen
}: AdvancedFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<FilterOptions>({...filters});
  
  // Update local filters when props change
  useEffect(() => {
    setLocalFilters({...filters});
  }, [filters]);

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleResetFilters = () => {
    const resetFilters: FilterOptions = {
      priceRange: [0, 50000],
      brands: [],
      categories: [],
      rating: 0,
      inStock: false,
      onSale: false,
      sortBy: 'popularity'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const toggleBrand = (brand: string) => {
    setLocalFilters(prev => ({
      ...prev,
      brands: prev.brands.includes(brand)
        ? prev.brands.filter(b => b !== brand)
        : [...prev.brands, brand]
    }));
  };

  const toggleCategory = (category: string) => {
    setLocalFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <Filter size={20} className="mr-2" />
                Advanced Filters
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="flex items-center space-x-4">
                    <input
                      type="number"
                      placeholder="Min"
                      value={localFilters.priceRange[0]}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        priceRange: [parseInt(e.target.value) || 0, prev.priceRange[1]]
                      }))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={localFilters.priceRange[1]}
                      onChange={(e) => setLocalFilters(prev => ({
                        ...prev,
                        priceRange: [prev.priceRange[0], parseInt(e.target.value) || 50000]
                      }))}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={localFilters.priceRange[1]}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      priceRange: [prev.priceRange[0], parseInt(e.target.value)]
                    }))}
                    className="w-full mt-2"
                  />
                </div>

                {/* Categories */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableCategories.map(category => (
                      <label key={category} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters.categories.includes(category)}
                          onChange={() => toggleCategory(category)}
                          className="sr-only"
                        />
                        <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-2 ${
                          localFilters.categories.includes(category)
                            ? 'bg-primary border-primary'
                            : 'border-gray-300'
                        }`}>
                          {localFilters.categories.includes(category) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Brands</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {availableBrands.map(brand => (
                      <label key={brand} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localFilters.brands.includes(brand)}
                          onChange={() => toggleBrand(brand)}
                          className="sr-only"
                        />
                        <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-2 ${
                          localFilters.brands.includes(brand)
                            ? 'bg-primary border-primary'
                            : 'border-gray-300'
                        }`}>
                          {localFilters.brands.includes(brand) && (
                            <Check size={12} className="text-white" />
                          )}
                        </div>
                        <span className="text-sm">{brand}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Minimum Rating</h3>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        onClick={() => setLocalFilters(prev => ({
                          ...prev,
                          rating: prev.rating === rating ? 0 : rating
                        }))}
                        className={`flex items-center px-3 py-2 rounded-md border ${
                          localFilters.rating >= rating
                            ? 'bg-yellow-50 border-yellow-300'
                            : 'border-gray-300'
                        }`}
                      >
                        <Star
                          size={16}
                          fill={localFilters.rating >= rating ? "#fbbf24" : "none"}
                          className={localFilters.rating >= rating ? "text-yellow-400" : "text-gray-300"}
                        />
                        <span className="ml-1 text-sm">{rating}+</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Filters */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Quick Filters</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.inStock}
                        onChange={(e) => setLocalFilters(prev => ({
                          ...prev,
                          inStock: e.target.checked
                        }))}
                        className="sr-only"
                      />
                      <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-2 ${
                        localFilters.inStock
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      }`}>
                        {localFilters.inStock && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm">In Stock Only</span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={localFilters.onSale}
                        onChange={(e) => setLocalFilters(prev => ({
                          ...prev,
                          onSale: e.target.checked
                        }))}
                        className="sr-only"
                      />
                      <div className={`flex items-center justify-center w-5 h-5 border-2 rounded mr-2 ${
                        localFilters.onSale
                          ? 'bg-primary border-primary'
                          : 'border-gray-300'
                      }`}>
                        {localFilters.onSale && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span className="text-sm">On Sale</span>
                    </label>
                  </div>
                </div>

                {/* Sort By */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Sort By</h3>
                  <select
                    value={localFilters.sortBy}
                    onChange={(e) => setLocalFilters(prev => ({
                      ...prev,
                      sortBy: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="popularity">Popularity</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="sales">Best Selling</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={handleResetFilters}
              >
                Reset All
              </Button>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleApplyFilters}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdvancedFilters;