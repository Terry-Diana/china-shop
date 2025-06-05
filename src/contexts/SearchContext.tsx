import { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  suggestions: string[];
  setSuggestions: (suggestions: string[]) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const addToSearchHistory = (query: string) => {
    if (!query.trim() || searchHistory.includes(query)) return;
    setSearchHistory(prev => [query, ...prev].slice(0, 10));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        searchHistory,
        addToSearchHistory,
        clearSearchHistory,
        suggestions,
        setSuggestions,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};