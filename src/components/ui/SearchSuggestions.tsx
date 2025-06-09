import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, TrendingUp } from 'lucide-react';
import { mockProducts } from '../../data/mockProducts';
import { useAnalytics } from '../../hooks/useAnalytics';

interface SearchSuggestionsProps {
  query: string;
  onSuggestionClick: (suggestion: string) => void;
  onClose: () => void;
  isVisible: boolean;
}

const SearchSuggestions = ({ query, onSuggestionClick, onClose, isVisible }: SearchSuggestionsProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState(['wireless headphones', 'smart watch', 'running shoes', 'laptop']);
  const { trackSearch } = useAnalytics();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      // Generate suggestions based on products
      const productSuggestions = mockProducts
        .filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.brand.toLowerCase().includes(query.toLowerCase()) ||
          product.category.toLowerCase().includes(query.toLowerCase())
        )
        .map(product => product.name)
        .slice(0, 5);

      // Add category and brand suggestions
      const categorySuggestions = Array.from(new Set(
        mockProducts
          .filter(product => 
            product.category.toLowerCase().includes(query.toLowerCase())
          )
          .map(product => product.category)
      )).slice(0, 3);

      const brandSuggestions = Array.from(new Set(
        mockProducts
          .filter(product => 
            product.brand.toLowerCase().includes(query.toLowerCase())
          )
          .map(product => product.brand)
      )).slice(0, 3);

      setSuggestions([
        ...productSuggestions,
        ...categorySuggestions,
        ...brandSuggestions,
      ].slice(0, 8));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSuggestionClick = (suggestion: string) => {
    // Add to recent searches
    const updatedRecent = [suggestion, ...recentSearches.filter(s => s !== suggestion)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    
    // Track search
    trackSearch(suggestion, suggestions.length);
    
    onSuggestionClick(suggestion);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border z-50 max-h-96 overflow-y-auto"
      >
        {query.length > 1 && suggestions.length > 0 && (
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 px-3 py-2">
              Suggestions
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center"
              >
                <Search size={14} className="text-gray-400 mr-3" />
                <span className="text-sm">{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        {query.length <= 1 && (
          <>
            {recentSearches.length > 0 && (
              <div className="p-2 border-b">
                <div className="text-xs font-medium text-gray-500 px-3 py-2 flex items-center">
                  <Clock size={12} className="mr-1" />
                  Recent Searches
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center"
                  >
                    <Clock size={14} className="text-gray-400 mr-3" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </div>
            )}

            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2 flex items-center">
                <TrendingUp size={12} className="mr-1" />
                Trending Searches
              </div>
              {trendingSearches.map((search, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center"
                >
                  <TrendingUp size={14} className="text-gray-400 mr-3" />
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default SearchSuggestions;