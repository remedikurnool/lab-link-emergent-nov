'use client';

import { useState, useMemo } from 'react';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import { packagesWithCentres, diagnosticCenters } from '@/lib/data/mockDataWithCentres';
import { useSearchStore } from '@/store/searchStore';
import { useDebounce } from '@/hooks/use-debounce';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function PackagesPage() {
  const [showFilters, setShowFilters] = useState(false);
  const {
    searchQuery,
    selectedCentre,
    setSearchQuery,
    setSelectedCentre,
    resetFilters,
  } = useSearchStore();

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { addItem } = useCartStore();

  const filteredPackages = useMemo(() => {
    return packagesWithCentres.filter((pkg) => {
      const matchesSearch =
        debouncedSearch === '' ||
        pkg.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        pkg.description?.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesCentre =
        selectedCentre === 'all' ||
        pkg.centres.some((c) => c.centreId === selectedCentre);

      return matchesSearch && matchesCentre;
    });
  }, [debouncedSearch, selectedCentre]);

  const handleAddToCart = (pkg: any, centre: any) => {
    addItem({
      id: pkg.id,
      type: 'package',
      name: pkg.name,
      price: centre.price,
      originalPrice: centre.originalPrice,
      diagnosticCenterId: centre.centreId,
      diagnosticCenterName: centre.centreName,
      reportDeliveryTime: centre.reportDeliveryTime,
      testsIncluded: pkg.testsIncluded,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Health Packages</h1>
              <p className="text-sm text-gray-600">
                {filteredPackages.length} packages available
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for health packages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          {showFilters && (
            <div className="bg-white rounded-xl p-4 space-y-4 border border-gray-200">
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">
                  Diagnostic Centre
                </label>
                <select
                  value={selectedCentre}
                  onChange={(e) => setSelectedCentre(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPackages.map((pkg) => {
              return (
                <div
                  key={pkg.id}
                  className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  {pkg.popular && (
                    <div className="flex items-center gap-1 mb-2 text-yellow-600">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-xs font-semibold">POPULAR</span>
                    </div>
                  )}
                  
                  <Link href={`/packages/${pkg.id}`}>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary-600">
                      {pkg.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {pkg.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tests Included:</span>
                      <span className="font-semibold">{pkg.testsIncluded}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Available at:</span>
                      <span className="font-semibold">{pkg.centres.length} centres</span>
                    </div>
                  </div>

                  {/* Centre Selector */}
                  {pkg.centres.length > 1 ? (
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
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      >
                        {pkg.centres.map((centre) => (
                          <option key={centre.centreId} value={centre.centreId}>
                            {centre.centreName} - ₹{centre.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="mb-4 text-sm text-gray-600">
                      {pkg.centres[0].centreName}
                    </div>
                  )}

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{pkg.centres[0].price}
                      </span>
                      {pkg.centres[0].originalPrice && (
                        <>
                          <span className="text-sm line-through text-gray-400">
                            ₹{pkg.centres[0].originalPrice}
                          </span>
                          <span className="text-sm font-semibold text-green-600">
                            {pkg.centres[0].discount}% OFF
                          </span>
                        </>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/packages/${pkg.id}`}
                        className="flex-1 py-2 text-center bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={(e) => {
                          const card = e.currentTarget.closest('.bg-white');
                          const selectedCentreId = card?.getAttribute('data-selected-centre') || pkg.centres[0].centreId;
                          const centre = pkg.centres.find((c) => c.centreId === selectedCentreId) || pkg.centres[0];
                          handleAddToCart(pkg, centre);
                        }}
                        className="flex-1 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors text-sm"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPackages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No packages found matching your criteria</p>
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
