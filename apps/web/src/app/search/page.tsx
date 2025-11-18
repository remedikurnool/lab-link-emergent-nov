'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Search, TestTube, Scan, Package, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

interface SearchResult {
  id: string;
  type: 'test' | 'scan' | 'package';
  name: string;
  description?: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  centres?: Array<{
    centreId: string;
    centreName: string;
    price: number;
    originalPrice?: number;
    discount?: number;
  }>;
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'test' | 'scan' | 'package'>('all');
  const { addItem } = useCartStore();

  useEffect(() => {
    if (query) {
      fetchSearchResults(query);
    } else {
      setIsLoading(false);
    }
  }, [query]);

  const fetchSearchResults = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResults = filterType === 'all' 
    ? results 
    : results.filter((r) => r.type === filterType);

  const getTypeIcon = (type: 'test' | 'scan' | 'package') => {
    switch (type) {
      case 'test':
        return <TestTube className="w-5 h-5" />;
      case 'scan':
        return <Scan className="w-5 h-5" />;
      case 'package':
        return <Package className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: 'test' | 'scan' | 'package') => {
    switch (type) {
      case 'test':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'scan':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'package':
        return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const handleAddToCart = (result: SearchResult, centre?: SearchResult['centres'][0]) => {
    if (!centre && result.centres && result.centres.length > 0) {
      centre = result.centres[0];
    }
    
    if (centre) {
      addItem({
        id: result.id,
        type: result.type,
        name: result.name,
        price: centre.price,
        originalPrice: centre.originalPrice,
        diagnosticCenterId: centre.centreId,
        diagnosticCenterName: centre.centreName,
        reportDeliveryTime: centre.reportDeliveryTime || '24 hours',
      });
    }
  };

  const getTypeRoute = (type: 'test' | 'scan' | 'package', id: string) => {
    const typeMap = {
      test: 'tests',
      scan: 'scans',
      package: 'packages',
    };
    return `/${typeMap[type]}/${id}`;
  };

  const typeCounts = {
    all: results.length,
    test: results.filter((r) => r.type === 'test').length,
    scan: results.filter((r) => r.type === 'scan').length,
    package: results.filter((r) => r.type === 'package').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
              {query && (
                <p className="text-sm text-gray-600 mt-1">
                  {isLoading ? 'Searching...' : `${filteredResults.length} results for "${query}"`}
                </p>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for tests, scans, or packages..."
              defaultValue={query}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const newQuery = (e.target as HTMLInputElement).value;
                  if (newQuery.trim()) {
                    router.push(`/search?q=${encodeURIComponent(newQuery.trim())}`);
                  }
                }
              }}
              className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {(['all', 'test', 'scan', 'package'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filterType === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)} ({typeCounts[type]})
              </button>
            ))}
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500 mb-4" />
              <p className="text-sm text-gray-600">Searching...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-semibold text-gray-900 mb-2">No results found</p>
              <p className="text-sm text-gray-600 text-center max-w-md">
                {query
                  ? `We couldn't find any results for "${query}". Try different keywords or check your spelling.`
                  : 'Enter a search query to find tests, scans, or packages.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result) => {
                const bestCentre = result.centres
                  ? result.centres.reduce((best, current) =>
                      current.price < best.price ? current : best
                    )
                  : null;

                return (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-3 rounded-lg ${getTypeColor(result.type)} flex-shrink-0`}
                      >
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <Link
                              href={getTypeRoute(result.type, result.id)}
                              className="block"
                            >
                              <h3 className="font-semibold text-gray-900 mb-1 hover:text-primary-600 transition-colors">
                                {result.name}
                              </h3>
                            </Link>
                            {result.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                {result.description}
                              </p>
                            )}
                            {result.category && (
                              <span className="inline-block text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                {result.category}
                              </span>
                            )}
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex-shrink-0">
                            {result.type}
                          </span>
                        </div>

                        {bestCentre && (
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="text-xs text-gray-500">Starting from</p>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-lg text-gray-900">
                                    ₹{bestCentre.price}
                                  </span>
                                  {bestCentre.originalPrice &&
                                    bestCentre.originalPrice > bestCentre.price && (
                                      <span className="text-sm text-gray-500 line-through">
                                        ₹{bestCentre.originalPrice}
                                      </span>
                                    )}
                                  {bestCentre.discount && bestCentre.discount > 0 && (
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                                      {bestCentre.discount}% OFF
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {result.centres?.length} centre{result.centres?.length !== 1 ? 's' : ''} available
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                href={getTypeRoute(result.type, result.id)}
                                className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors"
                              >
                                View Details
                              </Link>
                              {bestCentre && (
                                <button
                                  onClick={() => handleAddToCart(result, bestCentre)}
                                  className="px-4 py-2 text-sm font-medium bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                                >
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

