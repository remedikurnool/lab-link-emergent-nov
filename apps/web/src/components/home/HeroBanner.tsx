'use client';

import { Clock } from 'lucide-react';

export function HeroBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-400 to-cyan-500 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-white text-xl font-bold mb-2">
            NEED AN URGENT
            <br />
            <span className="text-2xl">BLOOD TEST?</span>
          </h2>
          <p className="text-white/90 text-sm mb-3">
            CHOOSE INDIA'S FASTEST LAB
          </p>
          <div className="flex items-center gap-4 mb-3">
            <div className="bg-teal-300 rounded-full px-3 py-1.5">
              <div className="flex items-center gap-1 text-white font-bold text-sm">
                <Clock className="w-4 h-4" />
                <span>REPORT IN</span>
              </div>
              <div className="text-white text-lg font-bold">6 HOURS</div>
            </div>
            <div className="text-white">
              <div className="text-3xl font-bold">#1</div>
              <div className="text-xs">Rated Lab</div>
              <div className="text-yellow-300 text-lg">★ 4.9/5</div>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 w-32 h-32 relative">
          <div className="w-full h-full bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-6xl">👨‍⚕️</span>
          </div>
        </div>
      </div>
    </div>
  );
}
