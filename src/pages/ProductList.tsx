import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Sliders, Filter, X, Grid, List } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import VirtualizedList from '../components/ui/VirtualizedList';
import AdvancedFilters from '../components/ui/AdvancedFilters';
import { useProducts } from '../hooks/useProducts';
import Button from '../components/ui/Button';
import { useAnalytics } from '../hooks/useAnalytics';
import { Product } from '../types/product';

const ProductList = () => {
  const { category } = useParams<{ category: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');
  const filterParam = searchParams.get('filter');
  const { products, loading } = useProducts();
  const { trackSearch } = useAnalytics();
  
  // Use refs to prevent unnecessary re-renders
  const searchTrackedRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef(true);
  
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [useVirtualization, setUseVirtualization] = useState(false);
  
  // Initialize filters with useCallback to maintain referential equality
  const getInitialFilters = useCallback(() => ({
    priceRange: [0, 50000] as [number, number],
    brands: [] as string[],
    categories: [] as string[],
    rating: 0,
    inStock: false,
    onSale: false,
    sortBy: 'popularity'
  }), []);
  
  const [filters, setFilters] = useState(getInitialFilters);
  
  // Memoize brands and categories to prevent unnecessary recalculations
  const brands = useMemo(() => {
    if (!products.length) return [];
    return [...new Set(products.map(product => product.brand).filter(Boolean))];
  }, [products]);
  
  const categories = useMemo(() => {
    if (!products.length) return [];
    return [...new Set(products.map(product => product.category).filter(Boolean))];
  }, [products]);

  // Stable callback for tracking search
  const stableTrackSearch = useCallback((query: string, resultCount: number) => {
    const searchKey = `${query}-${resultCount}`;
    if (!searchTrackedRef.current.has(searchKey)) {
      searchTrackedRef.current.add(searchKey);
      trackSearch(query, resultCount);
    }
  }, [trackSearch]);

  // Reset filters when route changes - separated from filter application
  useEffect(() => {
    const newFilters = getInitialFilters();
    setFilters(newFilters);
    
    // Clear search tracking cache
    searchTrackedRef.current.clear();
    
    // Update document title
    if (category) {
      document.title = `${category.charAt(0).toUpperCase() + category.slice(1)} | China Square`;
    } else if (searchQuery) {
      document.title = `Search: ${searchQuery} | China Square`;
    } else {
      document.title = 'All Products | China Square';
    }
    
    // Scroll to top when params change
    if (!initialLoadRef.current) {
      window.scrollTo(0, 0);
    }
    initialLoadRef.current = false;
  }, [category, searchQuery, filterParam, getInitialFilters]);

  // Apply filters and sorting - stable dependency array
  useEffect(() => {
    if (!products.length) {
      setFilteredProducts([]);
      return;
    }
    
    let result = [...products];
    
    // Apply category filter first if specified
    if (category) {
      result = result.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query)
      );
    }
    
    // Apply special filters (new, best-sellers, deals)
    if (filterParam) {
      switch (filterParam) {
        case 'new':
          result = result.filter(p => p.isNew);
          break;
        case 'best-sellers':
          result = result.filter(p => p.bestSeller);
          break;
        case 'deals':
        case 'sale':
          result = result.filter(p => p.discount > 0);
          break;
      }
    }
    
    // Apply price filter
    const [minPrice, maxPrice] = filters.priceRange;
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);
    
    // Apply brand filter
    if (filters.brands.length > 0) {
      result = result.filter(p => filters.brands.includes(p.brand));
    }
    
    // Apply category filter (additional categories from filter)
    if (filters.categories.length > 0) {
      result = result.filter(p => filters.categories.includes(p.category));
    }
    
    // Apply rating filter
    if (filters.rating > 0) {
      result = result.filter(p => p.rating >= filters.rating);
    }
    
    // Apply stock filter
    if (filters.inStock) {
      result = result.filter(p => p.stock > 0);
    }
    
    // Apply sale filter
    if (filters.onSale) {
      result = result.filter(p => p.discount > 0);
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => (a.isNew === b.isNew) ? 0 : a.isNew ? -1 : 1);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'sales':
        result.sort((a, b) => (a.bestSeller === b.bestSeller) ? 0 : a.bestSeller ? -1 : 1);
        break;
      default: // popularity
        result.sort((a, b) => (a.bestSeller === b.bestSeller) ? 0 : a.bestSeller ? -1 : 1);
    }
    
    setFilteredProducts(result);
    setUseVirtualization(result.length > 50);
    
    // Track search after filtering is complete
    if (searchQuery && !searchTrackedRef.current.has(`${searchQuery}-${result.length}`)) {
      stableTrackSearch(searchQuery, result.length);
    }
  }, [products, filters, category, searchQuery, filterParam, stableTrackSearch]);
  
  // Generate page title
  const getPageTitle = useCallback(() => {
    if (category) {
      return category.charAt(0).toUpperCase() + category.slice(1);
    }
    if (searchQuery) {
      return `Search Results for "${searchQuery}"`;
    }
    if (filterParam) {
      switch (filterParam) {
        case 'new': return 'New Arrivals';
        case 'best-sellers': return 'Best Sellers';
        case 'deals': return 'Deals & Discounts';
        case 'sale': return 'Sale Items';
      }
    }
    return 'All Products';
  }, [category, searchQuery, filterParam]);

  // Optimized render function
  const renderProductItem = useCallback((product: Product, index: number) => (
    <div key={product.id} className={viewMode === 'grid' ? 'p-2' : 'p-4 border-b'}>
      <ProductCard product={product} />
    </div>
  ), [viewMode]);

  // Stable filter handlers
  const handlePriceRangeChange = useCallback((value: number) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [prev.priceRange[0], value]
    }));
  }, []);

  const handleQuickFilterChange = useCallback((filterName: 'inStock' | 'onSale', checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: checked
    }));
  }, []);

  const handleSortChange = useCallback((sortBy: string) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters(getInitialFilters());
    searchTrackedRef.current.clear();
  }, [getInitialFilters]);

  // Stable view mode handlers
  const handleViewModeChange = useCallback((mode: 'grid' | 'list') => {
    setViewMode(mode);
  }, []);

  const handleMobileFilterToggle = useCallback(() => {
    setIsMobileFilterOpen(prev => !prev);
  }, []);

  const handleAdvancedFiltersToggle = useCallback(() => {
    setShowAdvancedFilters(prev => !prev);
  }, []);

  // Show loading only if we're actually loading and have no products yet
  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
          <p className="text-gray-600">
            {filteredProducts.length} products found
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Ksh {filters.priceRange[0]}</span>
                  <span className="text-sm text-gray-600">Ksh {filters.priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="1000"
                  value={filters.priceRange[1]}
                  onChange={e => handlePriceRangeChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <style jsx>{`
                  .slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #bb313e;
                    cursor: pointer;
                  }
                  .slider::-moz-range-thumb {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #bb313e;
                    cursor: pointer;
                    border: none;
                  }
                `}</style>
              </div>
              
              {/* Quick Filters */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Quick Filters</h3>
                <div className="space-y-2">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleQuickFilterChange('inStock', e.target.checked)}
                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700">In Stock Only</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.onSale}
                      onChange={(e) => handleQuickFilterChange('onSale', e.target.checked)}
                      className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <span className="ml-2 text-gray-700">On Sale</span>
                  </label>
                </div>
              </div>
              
              {/* Advanced Filters Button */}
              <Button
                variant="outline"
                fullWidth
                icon={<Sliders size={16} />}
                onClick={handleAdvancedFiltersToggle}
              >
                Advanced Filters
              </Button>
              
              {/* Clear Filters */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-primary hover:text-primary-dark"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="flex-grow">
            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  icon={<Filter size={16} />}
                  onClick={handleMobileFilterToggle}
                >
                  Filters
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  icon={<Sliders size={16} />}
                  onClick={handleAdvancedFiltersToggle}
                >
                  Advanced
                </Button>
              </div>
              
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleViewModeChange('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-600'}`}
                  >
                    <Grid size={16} />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-600'}`}
                  >
                    <List size={16} />
                  </button>
                </div>
                
                {/* Sort Dropdown */}
                <div className="flex items-center">
                  <label htmlFor="sort" className="mr-2 text-sm text-gray-700">Sort by:</label>
                  <select
                    id="sort"
                    value={filters.sortBy}
                    onChange={e => handleSortChange(e.target.value)}
                    className="bg-white border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
            
            {/* Products */}
            {filteredProducts.length > 0 ? (
              useVirtualization ? (
                <VirtualizedList
                  items={filteredProducts}
                  itemHeight={viewMode === 'grid' ? 400 : 200}
                  containerHeight={800}
                  renderItem={renderProductItem}
                  className="bg-white rounded-lg shadow-sm"
                />
              ) : (
                <div className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
                    : 'space-y-4'
                }`}>
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search term.</p>
                <Button 
                  variant="primary"
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Advanced Filters Modal */}
      <AdvancedFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableBrands={brands}
        availableCategories={categories}
        onClose={() => setShowAdvancedFilters(false)}
        isOpen={showAdvancedFilters}
      />
      
      {/* Mobile Filters */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden">
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-semibold text-lg">Filters</h2>
              <button 
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-6">
                {/* Price Range - Mobile */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Ksh {filters.priceRange[0]}</span>
                    <span className="text-sm text-gray-600">Ksh {filters.priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50000"
                    step="1000"
                    value={filters.priceRange[1]}
                    onChange={e => handlePriceRangeChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Quick Filters</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.inStock}
                        onChange={(e) => handleQuickFilterChange('inStock', e.target.checked)}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <span className="ml-2 text-gray-700">In Stock Only</span>
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.onSale}
                        onChange={(e) => handleQuickFilterChange('onSale', e.target.checked)}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <span className="ml-2 text-gray-700">On Sale</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex gap-4">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={clearAllFilters}
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;