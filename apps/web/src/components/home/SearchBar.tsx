'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Loader2, TestTube, Scan, Package, ArrowRight } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SearchResult {
  id: string;
  type: 'test' | 'scan' | 'package';
  name: string;
  description?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
}

interface AutocompleteSuggestion {
  text: string;
  type?: 'test' | 'scan' | 'package';
}

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [autocompleteTexts, setAutocompleteTexts] = useState<string[]>([]);
  const debouncedQuery = useDebounce(query, 300);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch search results
  const fetchSearchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSuggestions([]);
      setAutocompleteTexts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch both autocomplete suggestions and search results
      const [autocompleteRes, searchRes] = await Promise.all([
        fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&autocomplete=true&limit=5`),
        fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`),
      ]);

      const autocompleteData = await autocompleteRes.json();
      const searchData = await searchRes.json();

      setAutocompleteTexts(autocompleteData.suggestions || []);
      setSuggestions(searchData.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
      setAutocompleteTexts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSearchResults(debouncedQuery);
  }, [debouncedQuery, fetchSearchResults]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setShowDropdown(true);
      return;
    }

    const totalItems = suggestions.length + autocompleteTexts.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowDropdown(true);
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectResult(suggestions[selectedIndex]);
      } else if (selectedIndex >= suggestions.length) {
        const autocompleteIndex = selectedIndex - suggestions.length;
        if (autocompleteTexts[autocompleteIndex]) {
          setQuery(autocompleteTexts[autocompleteIndex]);
          inputRef.current?.focus();
        }
      } else if (query.trim().length >= 2) {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setSelectedIndex(-1);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const typeMap = {
      test: 'tests',
      scan: 'scans',
      package: 'packages',
    };
    router.push(`/${typeMap[result.type]}/${result.id}`);
    setShowDropdown(false);
    setQuery('');
    setSelectedIndex(-1);
  };

  const handleSearch = () => {
    if (query.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
      setQuery('');
    }
  };

  const getTypeIcon = (type: 'test' | 'scan' | 'package') => {
    switch (type) {
      case 'test':
        return <TestTube className="w-4 h-4" />;
      case 'scan':
        return <Scan className="w-4 h-4" />;
      case 'package':
        return <Package className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: 'test' | 'scan' | 'package') => {
    switch (type) {
      case 'test':
        return 'bg-blue-100 text-blue-700';
      case 'scan':
        return 'bg-purple-100 text-purple-700';
      case 'package':
        return 'bg-green-100 text-green-700';
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '';
    return `₹${price}`;
  };

  const hasResults = suggestions.length > 0 || autocompleteTexts.length > 0;
  const showResults = showDropdown && (query.length >= 2) && (hasResults || isLoading);

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative transform-gpu" style={{ perspective: '1000px' }}>
        {/* 3D Shadow Layer */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            filter: 'blur(20px)',
            transform: 'translateZ(-20px) translateY(8px)',
            zIndex: -1,
          }}
        />
        
        {/* Main 3D Container */}
        <div 
          className="relative rounded-2xl transition-all duration-300 ease-out"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 50%, #ffffff 100%)',
            boxShadow: `
              0 20px 60px -15px rgba(0, 0, 0, 0.3),
              0 10px 30px -10px rgba(99, 102, 241, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.5),
              inset 0 2px 4px rgba(255, 255, 255, 0.8),
              inset 0 -2px 4px rgba(0, 0, 0, 0.05)
            `,
            transform: 'translateZ(0)',
            transformStyle: 'preserve-3d',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateZ(10px) translateY(-2px)';
            e.currentTarget.style.boxShadow = `
              0 25px 70px -15px rgba(0, 0, 0, 0.4),
              0 15px 40px -10px rgba(99, 102, 241, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.6),
              inset 0 2px 4px rgba(255, 255, 255, 0.9),
              inset 0 -2px 4px rgba(0, 0, 0, 0.08)
            `;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateZ(0)';
            e.currentTarget.style.boxShadow = `
              0 20px 60px -15px rgba(0, 0, 0, 0.3),
              0 10px 30px -10px rgba(99, 102, 241, 0.2),
              0 0 0 1px rgba(255, 255, 255, 0.5),
              inset 0 2px 4px rgba(255, 255, 255, 0.8),
              inset 0 -2px 4px rgba(0, 0, 0, 0.05)
            `;
          }}
        >
          <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <Search 
              className="w-5 h-5 text-gray-500 transition-all duration-300" 
              style={{ 
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15))',
                transform: 'translateZ(5px)',
              }}
            />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for tests, scans, or packages..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
              setSelectedIndex(-1);
            }}
            onFocus={(e) => {
              if (query.length >= 2) {
                setShowDropdown(true);
              }
              // 3D focus effect
              const container = e.currentTarget.closest('.relative');
              if (container) {
                (container as HTMLElement).style.transform = 'translateZ(15px) translateY(-3px)';
                (container as HTMLElement).style.boxShadow = `
                  0 30px 80px -15px rgba(99, 102, 241, 0.4),
                  0 15px 40px -10px rgba(139, 92, 246, 0.3),
                  0 0 0 2px rgba(99, 102, 241, 0.2),
                  inset 0 2px 4px rgba(255, 255, 255, 0.9),
                  inset 0 -2px 4px rgba(0, 0, 0, 0.1)
                `;
              }
              // Enhance search icon on focus
              const searchIcon = e.currentTarget.previousElementSibling?.querySelector('svg');
              if (searchIcon) {
                (searchIcon as HTMLElement).style.color = 'rgb(99, 102, 241)';
                (searchIcon as HTMLElement).style.transform = 'translateZ(8px) scale(1.1)';
              }
            }}
            onBlur={(e) => {
              const container = e.currentTarget.closest('.relative');
              if (container) {
                (container as HTMLElement).style.transform = 'translateZ(0)';
                (container as HTMLElement).style.boxShadow = `
                  0 20px 60px -15px rgba(0, 0, 0, 0.3),
                  0 10px 30px -10px rgba(99, 102, 241, 0.2),
                  0 0 0 1px rgba(255, 255, 255, 0.5),
                  inset 0 2px 4px rgba(255, 255, 255, 0.8),
                  inset 0 -2px 4px rgba(0, 0, 0, 0.05)
                `;
              }
              // Reset search icon on blur
              const searchIcon = e.currentTarget.previousElementSibling?.querySelector('svg');
              if (searchIcon) {
                (searchIcon as HTMLElement).style.color = 'rgb(107, 114, 128)';
                (searchIcon as HTMLElement).style.transform = 'translateZ(5px) scale(1)';
              }
            }}
            onKeyDown={handleKeyDown}
            className="w-full h-14 pl-14 pr-32 rounded-2xl bg-transparent text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm font-medium relative z-10"
            style={{
              textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
            }}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setSuggestions([]);
                setAutocompleteTexts([]);
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
              className="absolute right-20 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-all duration-200 z-10 hover:bg-gray-100"
              style={{
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleSearch}
            disabled={query.trim().length < 2}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-xl hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed z-10 transform-gpu"
            style={{
              boxShadow: `
                0 8px 20px -5px rgba(99, 102, 241, 0.4),
                0 4px 10px -3px rgba(99, 102, 241, 0.3),
                inset 0 1px 2px rgba(255, 255, 255, 0.2),
                inset 0 -1px 2px rgba(0, 0, 0, 0.1)
              `,
              transform: 'translateZ(5px)',
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.transform = 'translateZ(10px) scale(1.05)';
                e.currentTarget.style.boxShadow = `
                  0 12px 30px -5px rgba(99, 102, 241, 0.5),
                  0 6px 15px -3px rgba(99, 102, 241, 0.4),
                  inset 0 1px 2px rgba(255, 255, 255, 0.3),
                  inset 0 -1px 2px rgba(0, 0, 0, 0.15)
                `;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateZ(5px) scale(1)';
              e.currentTarget.style.boxShadow = `
                0 8px 20px -5px rgba(99, 102, 241, 0.4),
                0 4px 10px -3px rgba(99, 102, 241, 0.3),
                inset 0 1px 2px rgba(255, 255, 255, 0.2),
                inset 0 -1px 2px rgba(0, 0, 0, 0.1)
              `;
            }}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' }} />
            ) : (
              <Search className="w-5 h-5 text-white" style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2))' }} />
            )}
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown - 3D Styled */}
      {showResults && (
        <div 
          className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl z-50 max-h-96 overflow-y-auto transform-gpu"
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
            boxShadow: `
              0 25px 70px -15px rgba(0, 0, 0, 0.4),
              0 15px 40px -10px rgba(99, 102, 241, 0.3),
              0 0 0 1px rgba(255, 255, 255, 0.6),
              inset 0 2px 4px rgba(255, 255, 255, 0.9)
            `,
            transform: 'translateZ(20px) translateY(0)',
            transformStyle: 'preserve-3d',
            animation: 'searchDropdownSlide 0.3s ease-out',
          }}
        >
          {isLoading && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
              <p className="text-sm">Searching...</p>
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Results
              </div>
              {suggestions.map((result, index) => (
                <button
                  key={`${result.type}-${result.id}`}
                  onClick={() => handleSelectResult(result)}
                  onMouseEnter={(e) => {
                    setSelectedIndex(index);
                    e.currentTarget.style.transform = 'translateZ(5px) translateX(4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(99, 102, 241, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateZ(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedIndex === index
                      ? 'bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200'
                      : 'hover:bg-gray-50'
                  }`}
                  style={{
                    transform: 'translateZ(0)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${getTypeColor(result.type)} flex-shrink-0`}
                    >
                      {getTypeIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                          {result.name}
                        </h4>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                          {result.type}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-xs text-gray-600 line-clamp-1 mb-2">
                          {result.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        {result.price && (
                          <span className="font-bold text-sm text-gray-900">
                            {formatPrice(result.price)}
                          </span>
                        )}
                        {result.originalPrice && result.originalPrice > (result.price || 0) && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice(result.originalPrice)}
                          </span>
                        )}
                        {result.discount && result.discount > 0 && (
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                            {result.discount}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {!isLoading && autocompleteTexts.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">
                Suggestions
              </div>
              {autocompleteTexts.map((text, index) => {
                const suggestionIndex = suggestions.length + index;
                return (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => {
                      setQuery(text);
                      inputRef.current?.focus();
                    }}
                    onMouseEnter={(e) => {
                      setSelectedIndex(suggestionIndex);
                      e.currentTarget.style.transform = 'translateZ(5px) translateX(4px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px -2px rgba(99, 102, 241, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateZ(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                      selectedIndex === suggestionIndex
                        ? 'bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200'
                        : 'hover:bg-gray-50'
                    }`}
                    style={{
                      transform: 'translateZ(0)',
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {!isLoading && query.length >= 2 && !hasResults && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 mb-2">No results found</p>
              <p className="text-xs text-gray-400">Try a different search term</p>
            </div>
          )}

          {!isLoading && query.length >= 2 && hasResults && (
            <div className="p-3 border-t border-gray-100">
              <button
                onClick={handleSearch}
                className="w-full p-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              >
                View all results for &quot;{query}&quot;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
