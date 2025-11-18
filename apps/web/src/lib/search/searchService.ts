import Fuse from 'fuse.js';
import { testsWithCentres, scansWithCentres, packagesWithCentres } from '@/lib/data/mockDataWithCentres';

export interface SearchResult {
  id: string;
  type: 'test' | 'scan' | 'package';
  name: string;
  description?: string;
  category?: string;
  price?: number;
  originalPrice?: number;
  discount?: number;
  centres?: Array<{
    centreId: string;
    centreName: string;
    price: number;
    originalPrice?: number;
    discount?: number;
  }>;
  score?: number;
}

// Prepare searchable data
const prepareSearchData = (): SearchResult[] => {
  const results: SearchResult[] = [];

  // Add tests
  testsWithCentres.forEach((test) => {
    const lowestPrice = Math.min(...test.centres.map((c) => c.price));
    const lowestOriginalPrice = test.centres.find((c) => c.price === lowestPrice)?.originalPrice;
    const maxDiscount = Math.max(...test.centres.map((c) => c.discount || 0));

    results.push({
      id: test.id,
      type: 'test',
      name: test.name,
      description: test.description,
      category: test.category,
      price: lowestPrice,
      originalPrice: lowestOriginalPrice,
      discount: maxDiscount,
      centres: test.centres,
    });
  });

  // Add scans
  scansWithCentres.forEach((scan) => {
    const lowestPrice = Math.min(...scan.centres.map((c) => c.price));
    const lowestOriginalPrice = scan.centres.find((c) => c.price === lowestPrice)?.originalPrice;
    const maxDiscount = Math.max(...scan.centres.map((c) => c.discount || 0));

    results.push({
      id: scan.id,
      type: 'scan',
      name: scan.name,
      description: scan.description,
      category: scan.category,
      price: lowestPrice,
      originalPrice: lowestOriginalPrice,
      discount: maxDiscount,
      centres: scan.centres,
    });
  });

  // Add packages
  packagesWithCentres.forEach((pkg) => {
    const lowestPrice = Math.min(...pkg.centres.map((c) => c.price));
    const lowestOriginalPrice = pkg.centres.find((c) => c.price === lowestPrice)?.originalPrice;
    const maxDiscount = Math.max(...pkg.centres.map((c) => c.discount || 0));

    results.push({
      id: pkg.id,
      type: 'package',
      name: pkg.name,
      description: pkg.description,
      price: lowestPrice,
      originalPrice: lowestOriginalPrice,
      discount: maxDiscount,
      centres: pkg.centres,
    });
  });

  return results;
};

// Configure Fuse.js for fuzzy search
const fuseOptions: Fuse.IFuseOptions<SearchResult> = {
  keys: [
    { name: 'name', weight: 0.7 },
    { name: 'description', weight: 0.3 },
    { name: 'category', weight: 0.2 },
  ],
  threshold: 0.3, // Lower = more strict matching
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
  findAllMatches: true,
};

let searchIndex: Fuse<SearchResult> | null = null;

// Initialize search index
const getSearchIndex = (): Fuse<SearchResult> => {
  if (!searchIndex) {
    const data = prepareSearchData();
    searchIndex = new Fuse(data, fuseOptions);
  }
  return searchIndex;
};

/**
 * Search across tests, scans, and packages
 * @param query - Search query string
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Array of search results sorted by relevance
 */
export const search = (query: string, limit: number = 10): SearchResult[] => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const index = getSearchIndex();
  const results = index.search(query.trim(), { limit });

  return results.map((result) => ({
    ...result.item,
    score: result.score,
  }));
};

/**
 * Get autocomplete suggestions
 * @param query - Search query string
 * @param limit - Maximum number of suggestions (default: 5)
 * @returns Array of autocomplete suggestions
 */
export const getAutocompleteSuggestions = (query: string, limit: number = 5): string[] => {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const index = getSearchIndex();
  const results = index.search(query.trim(), { limit });

  // Extract unique names for autocomplete
  const suggestions = new Set<string>();
  results.forEach((result) => {
    const name = result.item.name;
    // Try to highlight matching part or return full name
    suggestions.add(name);
  });

  return Array.from(suggestions).slice(0, limit);
};

/**
 * Search by type (test, scan, or package)
 */
export const searchByType = (
  query: string,
  type: 'test' | 'scan' | 'package',
  limit: number = 10
): SearchResult[] => {
  const allResults = search(query, limit * 2); // Get more results to filter
  return allResults.filter((result) => result.type === type).slice(0, limit);
};

