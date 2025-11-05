import { create } from 'zustand';

interface SearchStore {
  searchQuery: string;
  selectedCategory: string;
  priceRange: [number, number];
  selectedCentre: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setPriceRange: (range: [number, number]) => void;
  setSelectedCentre: (centre: string) => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchQuery: '',
  selectedCategory: 'all',
  priceRange: [0, 10000],
  selectedCentre: 'all',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setPriceRange: (range) => set({ priceRange: range }),
  setSelectedCentre: (centre) => set({ selectedCentre: centre }),
  resetFilters: () =>
    set({
      searchQuery: '',
      selectedCategory: 'all',
      priceRange: [0, 10000],
      selectedCentre: 'all',
    }),
}));
