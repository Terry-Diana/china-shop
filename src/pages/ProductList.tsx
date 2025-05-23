import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Sliders, Filter, X, Check } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { mockProducts } from '../data/mockProducts';
import Button from '../components/ui/Button';

const ProductList = () => {
  const { category } = useParams<{ category: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');
  const filterParam = searchParams.get('filter');
  
  const [products, setProducts] = useState(mockProducts);
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState('popularity');
  
  // Extract unique brands from products
  const brands = [...new Set(mockProducts.map(product => product.brand))];
  
  // Update filters when params change
  useEffect(() => {
    let filtered = [...mockProducts];
    
    // Filter by category
    if (category) {
      filtered = filtered.filter(p => 
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by special filters (new, best-sellers, deals)
    if (filterParam) {
      switch (filterParam) {
        case 'new':
          filtered = filtered.filter(p => p.isNew);
          break;
        case 'best-sellers':
          filtered = filtered.filter(p => p.bestSeller);
          break;
        case 'deals':
        case 'sale':
          filtered = filtered.filter(p => p.discount > 0);
          break;
      }
    }
    
    setProducts(filtered);
    
    // Reset other filters
    setPriceRange([0, 1000]);
    setSelectedBrands([]);
    setSortOption('popularity');
    
    // Update document title
    if (category) {
      document.title = `${category.charAt(0).toUpperCase() + category.slice(1)} | ShopVista`;
    } else if (searchQuery) {
      document.title = `Search: ${searchQuery} | ShopVista`;
    } else {
      document.title = 'All Products | ShopVista';
    }
    
    // Scroll to top when params change
    window.scrollTo(0, 0);
  }, [category, searchQuery, filterParam]);
  
  // Apply filters
  useEffect(() => {
    let result = [...products];
    
    // Apply price filter
    result = result.filter(p => 
      p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    
    // Apply brand filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }
    
    // Apply sorting
    switch (sortOption) {
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
      default: // popularity
        result.sort((a, b) => (a.bestSeller === b.bestSeller) ? 0 : a.bestSeller ? -1 : 1);
    }
    
    setFilteredProducts(result);
  }, [products, priceRange, selectedBrands, sortOption]);
  
  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };
  
  // Generate page title
  const getPageTitle = () => {
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
  };

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
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">${priceRange[0]}</span>
                  <span className="text-sm text-gray-600">${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              {/* Brands */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Brands</h3>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <span className="ml-2 text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Clear Filters */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setPriceRange([0, 1000]);
                    setSelectedBrands([]);
                  }}
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
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden"
                icon={<Filter size={16} />}
                onClick={() => setIsMobileFilterOpen(true)}
              >
                Filters
              </Button>
              
              <div className="flex items-center ml-auto">
                <label htmlFor="sort" className="mr-2 text-sm text-gray-700">Sort by:</label>
                <select
                  id="sort"
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value)}
                  className="bg-white border border-gray-300 rounded-md py-1.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="popularity">Popularity</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="newest">Newest First</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
            
            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search term.</p>
                <Button 
                  variant="primary"
                  onClick={() => {
                    setPriceRange([0, 1000]);
                    setSelectedBrands([]);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
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
              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Price Range</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">${priceRange[0]}</span>
                  <span className="text-sm text-gray-600">${priceRange[1]}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="50"
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              {/* Brands */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Brands</h3>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => toggleBrand(brand)}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                      />
                      <span className="ml-2 text-gray-700">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 flex gap-4">
              <Button
                variant="outline"
                size="sm"
                fullWidth
                onClick={() => {
                  setPriceRange([0, 1000]);
                  setSelectedBrands([]);
                }}
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => setIsMobileFilterOpen(false)}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;