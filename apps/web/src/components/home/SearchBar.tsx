'use client';

import { Search } from 'lucide-react';

export function SearchBar() {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search for tests or checkups"
        className="w-full h-12 pl-4 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
      />
      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors">
        <Search className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}
