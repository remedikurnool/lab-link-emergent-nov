'use client';

import { Tag } from 'lucide-react';

export function DiscountBanner() {
  return (
    <div className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold">
      <Tag className="w-4 h-4" />
      <span>
        Get 20% off on orders above ₹500 | Use:{' '}  <span className="bg-white/20 px-2 py-0.5 rounded">DIAGNO20</span>
      </span>
    </div>
  );
}
