import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchSuggestions from './SearchSuggestions';
import { useAnalytics } from '../../hooks/useAnalytics';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { trackSearch } = useAnalytics();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      trackSearch(query.trim(), 0);
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
      setShowSuggestions(false);
      setIsFocused(false);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    navigate(`/products?search=${encodeURIComponent(suggestion)}`);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  const clearSearch = () => {
    setQuery('');
    setShowSuggestions(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
    }, 200);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <form onSubmit={handleSearch} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search products..."
          className="w-full py-2 pl-10 pr-4 text-sm bg-white rounded-md focus:outline-none focus:ring-2 focus:ring-accent transition-all duration-200"
          aria-label="Search"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={18} className="text-gray-400" />
        </div>
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-gray-100 rounded-r-md transition-colors"
            aria-label="Clear search"
          >
            <X size={18} className="text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </form>

      <SearchSuggestions
        query={query}
        onSuggestionClick={handleSuggestionClick}
        onClose={() => setShowSuggestions(false)}
        isVisible={showSuggestions && isFocused}
      />
    </div>
  );
};

export default SearchBar;