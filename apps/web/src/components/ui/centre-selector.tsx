'use client';

import { useState } from 'react';
import { Building2, ChevronDown } from 'lucide-react';

interface CentreSelectorProps {
  centres: Array<{
    centreId: string;
    centreName: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    reportDeliveryTime: string;
  }>;
  onCentreSelect: (centre: any) => void;
}

export function CentreSelector({ centres, onCentreSelect }: CentreSelectorProps) {
  const [selectedCentre, setSelectedCentre] = useState(centres[0]);
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (centre: any) => {
    setSelectedCentre(centre);
    onCentreSelect(centre);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Selected Centre Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1">
          <Building2 className="w-4 h-4" />
          <div className="text-left">
            <div className="text-xs opacity-80">Diagnostic Centre</div>
            <div className="font-semibold text-sm">{selectedCentre.centreName}</div>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 z-10 max-h-64 overflow-y-auto">
          {centres.map((centre) => (
            <button
              key={centre.centreId}
              type="button"
              onClick={() => handleSelect(centre)}
              className={`w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                selectedCentre.centreId === centre.centreId ? 'bg-primary-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm">
                    {centre.centreName}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Report: {centre.reportDeliveryTime}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">₹{centre.price}</div>
                  {centre.discount && (
                    <div className="text-xs text-green-600 font-semibold">
                      {centre.discount}% OFF
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
