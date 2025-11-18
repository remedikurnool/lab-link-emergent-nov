'use client';

import { useTests } from '@/hooks/use-supabase-queries';
import { Plus, Edit, Trash2, Search, TestTube, Clock, DollarSign } from 'lucide-react';
import { AddTestModal } from './AddTestModal';

interface Test {
  id: string;
  name: string;
  description?: string;
  category: string;
  sample_type?: string;
  tests_included?: number;
  parameters?: any;
  preparation_instructions?: string;
  is_active: boolean;
  created_at: string;
  centre_pricing?: CentrePricing[];
}

interface CentrePricing {
  id: string;
  centre_id: string;
  item_id: string;
  price: number;
  original_price?: number;
  discount?: number;
  report_delivery_time: string;
  home_collection: boolean;
  is_active: boolean;
  centre_name?: string;
}

export function TestsSection() {
  const [tests, setTests] = useState<Test[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);

  useEffect(() => {
    fetchTests();
    fetchCentres();

    // Set up real-time subscription for tests
    const testsChannel = supabase
      .channel('tests-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tests',
        },
        () => {
          fetchTests();
        }
      )
      .subscribe();

    // Set up real-time subscription for centre_pricing
    const pricingChannel = supabase
      .channel('tests-pricing-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'centre_pricing',
          filter: 'item_type=eq.test',
        },
        () => {
          fetchTests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(testsChannel);
      supabase.removeChannel(pricingChannel);
    };
  }, []);

  const fetchTests = async () => {
    try {
      // Fetch all tests (including those without pricing)
      const { data: testsData, error: testsError } = await supabase
        .from('tests')
        .select('*')
        .order('name');

      if (testsError) throw testsError;

      // Fetch all centre pricing for tests
      const { data: pricingData, error: pricingError } = await supabase
        .from('centre_pricing')
        .select(`
          *,
          diagnostic_centres(name)
        `)
        .eq('item_type', 'test')
        .eq('is_active', true);

      if (pricingError) throw pricingError;

      // Group centre pricing by test
      const testsMap = new Map<string, Test>();
      
      // First, create test entries
      testsData?.forEach((test: any) => {
        testsMap.set(test.id, {
          id: test.id,
          name: test.name,
          description: test.description,
          category: test.category,
          sample_type: test.sample_type,
          tests_included: test.tests_included,
          parameters: test.parameters,
          preparation_instructions: test.preparation_instructions,
          is_active: test.is_active,
          created_at: test.created_at,
          centre_pricing: [],
        });
      });

      // Then, add pricing to tests
      pricingData?.forEach((pricing: any) => {
        const test = testsMap.get(pricing.item_id);
        if (test) {
          test.centre_pricing?.push({
            id: pricing.id,
            centre_id: pricing.centre_id,
            item_id: pricing.item_id,
            price: parseFloat(pricing.price),
            original_price: pricing.original_price ? parseFloat(pricing.original_price) : undefined,
            discount: pricing.discount,
            report_delivery_time: pricing.report_delivery_time,
            home_collection: pricing.home_collection,
            is_active: pricing.is_active,
            centre_name: pricing.diagnostic_centres?.name,
          });
        }
      });

      setTests(Array.from(testsMap.values()));
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCentres = async () => {
    try {
      const { data, error } = await supabase
        .from('diagnostic_centres')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCentres(data || []);
    } catch (error) {
      console.error('Error fetching centres:', error);
    }
  };

  const filteredTests = tests.filter(test =>
    test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    test.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleTestStatus = async (testId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('tests')
        .update({ is_active: !currentStatus })
        .eq('id', testId);

      if (error) throw error;
      fetchTests();
    } catch (error) {
      console.error('Error updating test status:', error);
    }
  };

  const updateCentrePricing = async (
    pricingId: string,
    updates: Partial<Pick<CentrePricing, 'price' | 'original_price' | 'discount' | 'report_delivery_time' | 'home_collection'>>
  ) => {
    try {
      const { error } = await supabase
        .from('centre_pricing')
        .update(updates)
        .eq('id', pricingId);

      if (error) throw error;
      fetchTests();
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Test
        </button>
      </div>

      {/* Add Test Modal */}
      <AddTestModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          fetchTests();
          setShowAddForm(false);
        }}
        centres={centres}
      />

      {/* Tests List */}
      <div className="space-y-4">
        {filteredTests.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No tests found</p>
          </div>
        ) : (
          filteredTests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Test Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TestTube className="w-6 h-6 text-blue-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{test.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      test.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {test.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <button
                      onClick={() => toggleTestStatus(test.id, test.is_active)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        test.is_active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {test.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
                {test.description && (
                  <p className="text-gray-600 mt-2">{test.description}</p>
                )}
              </div>

              {/* Centre Pricing */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Centre Pricing</h4>
                {test.centre_pricing && test.centre_pricing.length > 0 ? (
                  <div className="space-y-3">
                    {test.centre_pricing.map((pricing) => (
                      <div
                        key={pricing.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div>
                            <div className="font-medium text-gray-900">{pricing.centre_name}</div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <DollarSign className="w-4 h-4" />
                              ₹{pricing.price}
                              {pricing.original_price && pricing.original_price > pricing.price && (
                                <span className="line-through text-gray-400">₹{pricing.original_price}</span>
                              )}
                              {pricing.discount && (
                                <span className="text-green-600 font-medium">({pricing.discount}% OFF)</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {pricing.report_delivery_time}
                          </div>
                          <div className="flex items-center gap-2">
                            {pricing.home_collection && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                                Home Collection
                              </span>
                            )}
                          </div>
                          <button className="px-3 py-1 text-primary-600 hover:bg-primary-50 rounded-lg text-sm font-medium">
                            Edit Pricing
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No centre pricing configured</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
