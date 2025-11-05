'use client';

import { useState } from 'react';
import { Clock, TestTube2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { CentreSelector } from '@/components/ui/centre-selector';

interface TestCardProps {
  test: {
    id: string;
    name: string;
    description?: string;
    testsIncluded?: number;
    centres: Array<{
      centreId: string;
      centreName: string;
      price: number;
      originalPrice?: number;
      discount?: number;
      reportDeliveryTime: string;
    }>;
  };
  gradient?: string;
  onAddToCart?: (test: any, centre: any) => void;
}

export function TestCard({ 
  test, 
  gradient = 'from-teal-400 to-cyan-500',
  onAddToCart 
}: TestCardProps) {
  const [selectedCentre, setSelectedCentre] = useState(test.centres[0]);

  const discountPercent = selectedCentre.discount || (
    selectedCentre.originalPrice
      ? Math.round(((selectedCentre.originalPrice - selectedCentre.price) / selectedCentre.originalPrice) * 100)
      : 0
  );

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(test, selectedCentre);
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white min-w-[280px] flex-shrink-0`}
    >
      <div className="flex flex-col h-full gap-3">
        {/* Test Name */}
        <h3 className="text-lg font-bold mb-1 line-clamp-2">{test.name}</h3>

        {/* Badge */}
        <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 text-xs font-semibold w-fit">
          <TestTube2 className="w-3 h-3" />
          <span>TEST</span>
        </div>

        {/* Centre Selector */}
        {test.centres.length > 1 && (
          <CentreSelector 
            centres={test.centres}
            onCentreSelect={setSelectedCentre}
          />
        )}

        {test.centres.length === 1 && (
          <div className="flex items-center gap-2 text-sm bg-white/10 px-3 py-2 rounded-lg">
            <Building2 className="w-4 h-4" />
            <span className="text-xs">{selectedCentre.centreName}</span>
          </div>
        )}

        {/* Info */}
        <div className="space-y-2 mb-2 flex-1">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>Reports: {selectedCentre.reportDeliveryTime}</span>
          </div>
          {test.testsIncluded && (
            <div className="flex items-center gap-2 text-sm">
              <TestTube2 className="w-4 h-4" />
              <span>{test.testsIncluded} test{test.testsIncluded > 1 ? 's' : ''} included</span>
            </div>
          )}
        </div>

        {/* Price and CTA */}
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              {selectedCentre.originalPrice && (
                <span className="text-sm line-through opacity-80">
                  ₹{selectedCentre.originalPrice}
                </span>
              )}
              <span className="text-2xl font-bold">₹{selectedCentre.price}</span>
            </div>
            {discountPercent > 0 && (
              <div className="text-xs font-semibold">
                {discountPercent}% OFF
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Link
              href={`/tests/${test.id}`}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors border border-white/30 text-center"
            >
              View Details
            </Link>
            <button 
              onClick={handleAddToCart}
              className="bg-white text-primary-600 hover:bg-gray-50 text-sm font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
