'use client';

import { useState, useMemo, useEffect } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Search, SlidersHorizontal, FlaskConical, Scan, Package } from 'lucide-react';
import { testsWithCentres, scansWithCentres, packagesWithCentres, diagnosticCenters } from '@/lib/data/mockDataWithCentres';
import { useSearchStore } from '@/store/searchStore';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { Tabs } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';

type TabType = 'Tests' | 'Scans' | 'Packages';

export default function TestsPage() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(tabParam || 'Tests');

  // Update tab when URL param changes
  useEffect(() => {
    if (tabParam && ['Tests', 'Scans', 'Packages'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [showFilters, setShowFilters] = useState(false);
  const {
    searchQuery,
    selectedCategory,
    priceRange,
    selectedCentre,
    setSearchQuery,
    setSelectedCategory,
    setSelectedCentre,
    resetFilters,
  } = useSearchStore();

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { addItem } = useCartStore();

  // Get data based on active tab
  const getData = () => {
    switch (activeTab) {
      case 'Tests':
        return testsWithCentres;
      case 'Scans':
        return scansWithCentres;
      case 'Packages':
        return packagesWithCentres;
      default:
        return testsWithCentres;
    }
  };

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    const data = getData();
    return data.filter((item: any) => {
      // Search filter
      const matchesSearch =
        debouncedSearch === '' ||
        item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(debouncedSearch.toLowerCase());

      // Category filter (only for Tests and Scans)
      const matchesCategory =
        activeTab === 'Packages' ||
        selectedCategory === 'all' ||
        item.category === selectedCategory;

      // Centre filter
      const matchesCentre =
        selectedCentre === 'all' ||
        item.centres?.some((c: any) => c.centreId === selectedCentre);

      // Price filter (only for Tests)
      if (activeTab === 'Tests' && priceRange) {
        const lowestPrice = Math.min(...(item.centres?.map((c: any) => c.price) || [0]));
        const matchesPrice = lowestPrice >= priceRange[0] && lowestPrice <= priceRange[1];
        return matchesSearch && matchesCategory && matchesCentre && matchesPrice;
      }

      return matchesSearch && matchesCategory && matchesCentre;
    });
  }, [debouncedSearch, selectedCategory, selectedCentre, priceRange, activeTab]);

  const handleAddToCart = (item: any, centre: any) => {
    const itemType = activeTab.toLowerCase().slice(0, -1) as 'test' | 'scan' | 'package';
    addItem({
      id: item.id,
      type: itemType,
      name: item.name,
      price: centre.price,
      originalPrice: centre.originalPrice,
      diagnosticCenterId: centre.centreId,
      diagnosticCenterName: centre.centreName,
      reportDeliveryTime: centre.reportDeliveryTime,
      testsIncluded: item.testsIncluded,
    });
  };

  const getCategoryOptions = () => {
    switch (activeTab) {
      case 'Tests':
        return ['all', 'blood', 'urine', 'other'];
      case 'Scans':
        return ['all', 'ultrasound', 'ct', 'mri', 'xray', 'ecg'];
      default:
        return [];
    }
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case 'Tests':
        return 'Search for tests...';
      case 'Scans':
        return 'Search for scans...';
      case 'Packages':
        return 'Search for health packages...';
      default:
        return 'Search...';
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'Tests':
        return 'Lab Tests';
      case 'Scans':
        return 'Medical Scans';
      case 'Packages':
        return 'Health Packages';
      default:
        return 'Tests & Scans';
    }
  };

  const getItemPath = (itemId: string) => {
    switch (activeTab) {
      case 'Tests':
        return `/tests/${itemId}`;
      case 'Scans':
        return `/scans/${itemId}`;
      case 'Packages':
        return `/packages/${itemId}`;
      default:
        return `/tests/${itemId}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getTitle()}</h1>
              <p className="text-sm text-gray-600">
                {filteredItems.length} {activeTab.toLowerCase()} available
              </p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl border border-gray-200 p-1">
            <Tabs
              tabs={['Tests', 'Scans', 'Packages']}
              defaultTab={activeTab}
              onTabChange={(tab) => setActiveTab(tab as TabType)}
            />
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={getPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-xl p-4 space-y-4 border border-gray-200">
              {/* Category Filter (only for Tests and Scans) */}
              {getCategoryOptions().length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-900 mb-2 block">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getCategoryOptions().map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                          selectedCategory === cat
                            ? 'bg-primary-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        )}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Centre Filter */}
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Diagnostic Centre
                </label>
                <select
                  value={selectedCentre}
                  onChange={(e) => setSelectedCentre(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="all">All Centres</option>
                  {diagnosticCenters.map((centre) => (
                    <option key={centre.id} value={centre.id}>
                      {centre.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={resetFilters}
                className="w-full py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Reset Filters
              </button>
            </div>
          )}

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems
              .filter((item: any) => item.centres && item.centres.length > 0)
              .map((item: any) => {
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    {/* Category Image */}
                    {item.categoryImage && (
                      <div className="w-full h-32 rounded-lg overflow-hidden mb-3 bg-gray-100">
                        <img
                          src={item.categoryImage}
                          alt={item.categoryName || item.category}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <Link href={getItemPath(item.id)}>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary-600">
                        {item.name}
                      </h3>
                    </Link>
                    {item.categoryName && (
                      <div className="mb-2">
                        <span className="inline-block px-2 py-1 bg-primary-50 text-primary-600 text-xs font-semibold rounded">
                          {item.categoryName}
                        </span>
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      {item.testsIncluded && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tests Included:</span>
                          <span className="font-semibold">{item.testsIncluded}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Available at:</span>
                        <span className="font-semibold">{item.centres.length} centres</span>
                      </div>
                    </div>

                    {/* Centre Selector */}
                    {item.centres && item.centres.length > 1 ? (
                      <div className="mb-4">
                        <label className="text-xs text-gray-600 mb-1 block">
                          Select Diagnostic Centre
                        </label>
                        <select
                          onChange={(e) => {
                            const card = e.target.closest('.bg-white');
                            if (card) {
                              card.setAttribute('data-selected-centre', e.target.value);
                            }
                          }}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                        >
                          {item.centres.map((centre: any) => (
                            <option key={centre.centreId} value={centre.centreId}>
                              {centre.centreName} - ₹{centre.price}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : item.centres && item.centres.length === 1 ? (
                      <div className="mb-4 text-sm text-gray-600">
                        {item.centres[0]?.centreName}
                      </div>
                    ) : null}

                    <div className="border-t border-gray-200 pt-3">
                      {item.centres && item.centres.length > 0 && (
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-2xl font-bold text-gray-900">
                            ₹{item.centres[0].price}
                          </span>
                          {item.centres[0].originalPrice && (
                            <>
                              <span className="text-sm line-through text-gray-400">
                                ₹{item.centres[0].originalPrice}
                              </span>
                              {item.centres[0].discount && (
                                <span className="text-sm font-semibold text-green-600">
                                  {item.centres[0].discount}% OFF
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Link
                          href={getItemPath(item.id)}
                          className="flex-1 py-2 text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors text-sm"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={(e) => {
                            if (!item.centres || item.centres.length === 0) return;
                            const card = e.currentTarget.closest('.bg-white');
                            const selectedCentreId =
                              card?.getAttribute('data-selected-centre') || item.centres[0]?.centreId;
                            const centre =
                              item.centres.find((c: any) => c.centreId === selectedCentreId) ||
                              item.centres[0];
                            if (centre) {
                              handleAddToCart(item, centre);
                            }
                          }}
                          className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors text-sm"
                          disabled={!item.centres || item.centres.length === 0}
                        >
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No {activeTab.toLowerCase()} found matching your criteria
              </p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
