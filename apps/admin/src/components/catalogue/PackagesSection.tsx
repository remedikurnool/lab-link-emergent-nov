'use client';

import { usePackages } from '@/hooks/use-supabase-queries';
import { Plus, Edit, Trash2, Search, Package, Clock, DollarSign, TestTube } from 'lucide-react';
import { AddPackageModal } from './AddPackageModal';

interface Package {
  id: string;
  name: string;
  description?: string;
  tests_included?: number;
  included_tests?: any;
  popular: boolean;
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

export function PackagesSection() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);

  useEffect(() => {
    fetchPackages();
    fetchCentres();

    // Set up real-time subscription for packages
    const packagesChannel = supabase
      .channel('packages-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'packages',
        },
        () => {
          fetchPackages();
        }
      )
      .subscribe();

    // Set up real-time subscription for centre_pricing
    const pricingChannel = supabase
      .channel('packages-pricing-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'centre_pricing',
          filter: 'item_type=eq.package',
        },
        () => {
          fetchPackages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(packagesChannel);
      supabase.removeChannel(pricingChannel);
    };
  }, []);

  const fetchPackages = async () => {
    try {
      // Fetch all packages (including those without pricing)
      const { data: packagesData, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .order('name');

      if (packagesError) throw packagesError;

      // Fetch all centre pricing for packages
      const { data: pricingData, error: pricingError } = await supabase
        .from('centre_pricing')
        .select(`
          *,
          diagnostic_centres(name)
        `)
        .eq('item_type', 'package')
        .eq('is_active', true);

      if (pricingError) throw pricingError;

      // Group centre pricing by package
      const packagesMap = new Map<string, Package>();
      
      // First, create package entries
      packagesData?.forEach((pkg: any) => {
        packagesMap.set(pkg.id, {
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          tests_included: pkg.tests_included,
          included_tests: pkg.included_tests,
          popular: pkg.popular,
          is_active: pkg.is_active,
          created_at: pkg.created_at,
          centre_pricing: [],
        });
      });

      // Then, add pricing to packages
      pricingData?.forEach((pricing: any) => {
        const pkg = packagesMap.get(pricing.item_id);
        if (pkg) {
          pkg.centre_pricing?.push({
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

      setPackages(Array.from(packagesMap.values()));
    } catch (error) {
      console.error('Error fetching packages:', error);
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

  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePackageStatus = async (packageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ is_active: !currentStatus })
        .eq('id', packageId);

      if (error) throw error;
      fetchPackages();
    } catch (error) {
      console.error('Error updating package status:', error);
    }
  };

  const togglePopularStatus = async (packageId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('packages')
        .update({ popular: !currentStatus })
        .eq('id', packageId);

      if (error) throw error;
      fetchPackages();
    } catch (error) {
      console.error('Error updating popular status:', error);
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
              placeholder="Search packages..."
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
          Add Package
        </button>
      </div>

      {/* Add Package Modal */}
      <AddPackageModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          fetchPackages();
          setShowAddForm(false);
        }}
        centres={centres}
      />

      {/* Packages List */}
      <div className="space-y-4">
        {filteredPackages.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No packages found</p>
          </div>
        ) : (
          filteredPackages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Package Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Package className="w-6 h-6 text-orange-600" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                        {pkg.popular && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {pkg.tests_included ? `${pkg.tests_included} tests included` : 'Custom package'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      pkg.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {pkg.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => togglePopularStatus(pkg.id, pkg.popular)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          pkg.popular
                            ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pkg.popular ? 'Unpopular' : 'Mark Popular'}
                      </button>
                      <button
                        onClick={() => togglePackageStatus(pkg.id, pkg.is_active)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          pkg.is_active
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {pkg.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
                {pkg.description && (
                  <p className="text-gray-600 mt-2">{pkg.description}</p>
                )}
                {pkg.included_tests && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Included Tests:</div>
                    <div className="flex flex-wrap gap-2">
                      {Object.keys(pkg.included_tests).map((testName) => (
                        <span
                          key={testName}
                          className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1"
                        >
                          <TestTube className="w-3 h-3" />
                          {testName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Centre Pricing */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Centre Pricing</h4>
                {pkg.centre_pricing && pkg.centre_pricing.length > 0 ? (
                  <div className="space-y-3">
                    {pkg.centre_pricing.map((pricing) => (
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
