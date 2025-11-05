'use client';

export function PromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 p-5">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-gray-800 text-lg font-bold mb-1">
            Running a fever?
          </h3>
          <p className="text-gray-600 text-sm mb-3">
            Book a Fever Profile today
          </p>
          <button className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2.5 px-6 rounded-lg transition-colors">
            Starts at ₹1999
          </button>
        </div>
        <div className="flex-shrink-0 w-32 h-32 relative">
          <div className="w-full h-full bg-pink-200/50 rounded-full flex items-center justify-center">
            <span className="text-6xl">🤒</span>
          </div>
        </div>
      </div>
    </div>
  );
}
