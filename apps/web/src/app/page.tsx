'use client';

import { useState } from 'react';
import { SearchBar } from '@/components/home/SearchBar';
import { HeroBanner } from '@/components/home/HeroBanner';
import { PromoBanner } from '@/components/home/PromoBanner';
import { CategoryIcons } from '@/components/home/CategoryIcons';
import { TestCard } from '@/components/cards/TestCard';
import { DiscountBanner } from '@/components/home/DiscountBanner';
import { Tabs } from '@/components/ui/tabs';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { testsWithCentres, scansWithCentres, packagesWithCentres } from '@/lib/data/mockDataWithCentres';
import { useCartStore } from '@/store/cartStore';
import { TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState('Tests');
  const { addItem } = useCartStore();

  const getDisplayItems = () => {
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

  const displayItems = getDisplayItems();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      {/* Main Content */}
      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Search */}
          <SearchBar />

          {/* Hero Banner */}
          <HeroBanner />

          {/* Limited Time Offer */}
          <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 border-2 border-yellow-300 rounded-xl py-3 px-4">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-800">
              <span>⚡</span>
              <span>Limited time offer: FLAT 25% OFF on all tests!</span>
              <span>⚡</span>
            </div>
          </div>

          {/* Promo Banner */}
          <PromoBanner />

          {/* Categories */}
          <CategoryIcons />

          {/* Tabs */}
          <div>
            <Tabs
              tabs={['Tests', 'Scans', 'Packages']}
              defaultTab="Tests"
              onTabChange={setActiveTab}
            />
          </div>

          {/* Most Booked Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Most Booked {activeTab}</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              👍 Trusted by 1Mn+ Customers
            </p>

            {/* Cards Container */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {displayItems.map((item, index) => {
                const gradients = [
                  'from-teal-400 to-cyan-500',
                  'from-purple-500 to-purple-700',
                  'from-blue-500 to-indigo-600',
                  'from-pink-500 to-rose-600',
                  'from-orange-400 to-red-500',
                  'from-emerald-400 to-teal-600',
                ];
                return (
                  <TestCard
                    key={item.id}
                    test={item}
                    gradient={gradients[index % gradients.length]}
                    onAddToCart={handleAddToCart}
                  />
                );
              })}
            </div>
          </div>

          {/* Discount Banner */}
          <DiscountBanner />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
