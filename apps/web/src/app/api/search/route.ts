import { NextRequest, NextResponse } from 'next/server';
import { search, getAutocompleteSuggestions, searchByType } from '@/lib/search/searchService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') as 'test' | 'scan' | 'package' | null;
    const autocomplete = searchParams.get('autocomplete') === 'true';
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (!query || query.trim().length < 2) {
      return NextResponse.json({
        results: [],
        suggestions: [],
        total: 0,
      });
    }

    if (autocomplete) {
      const suggestions = getAutocompleteSuggestions(query, limit);
      return NextResponse.json({
        suggestions,
        total: suggestions.length,
      });
    }

    let results;
    if (type && ['test', 'scan', 'package'].includes(type)) {
      results = searchByType(query, type, limit);
    } else {
      results = search(query, limit);
    }

    return NextResponse.json({
      results,
      total: results.length,
      query: query.trim(),
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      {
        error: 'Search failed',
        results: [],
        total: 0,
      },
      { status: 500 }
    );
  }
}

