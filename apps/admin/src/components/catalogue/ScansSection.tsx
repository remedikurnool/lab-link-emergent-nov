'use client';

import { useScans } from '@/hooks/use-supabase-queries';
import { Plus, Edit, Trash2, Search, ScanLine, Clock, DollarSign } from 'lucide-react';
import { AddScanModal } from './AddScanModal';

interface Scan {
  id: string;
  name: string;
  description?: string;
  category: string;
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

export function ScansSection() {
  const [scans, setScans] = useState<Scan[]>([]);
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingScan, setEditingScan] = useState<Scan | null>(null);

  useEffect(() => {
    fetchScans();
    fetchCentres();

    // Set up real-time subscription for scans
    const scansChannel = supabase
      .channel('scans-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scans',
        },
        () => {
          fetchScans();
        }
      )
      .subscribe();

    // Set up real-time subscription for centre_pricing
    const pricingChannel = supabase
      .channel('scans-pricing-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'centre_pricing',
          filter: 'item_type=eq.scan',
        },
        () => {
          fetchScans();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(scansChannel);
      supabase.removeChannel(pricingChannel);
    };
  }, []);

  const fetchScans = async () => {
    try {
      // Fetch all scans (including those without pricing)
      const { data: scansData, error: scansError } = await supabase
        .from('scans')
        .select('*')
        .order('name');

      if (scansError) throw scansError;

      // Fetch all centre pricing for scans
      const { data: pricingData, error: pricingError } = await supabase
        .from('centre_pricing')
        .select(`
          *,
          diagnostic_centres(name)
        `)
        .eq('item_type', 'scan')
        .eq('is_active', true);

      if (pricingError) throw pricingError;

      // Group centre pricing by scan
      const scansMap = new Map<string, Scan>();
      
      // First, create scan entries
      scansData?.forEach((scan: any) => {
        scansMap.set(scan.id, {
          id: scan.id,
          name: scan.name,
          description: scan.description,
          category: scan.category,
          preparation_instructions: scan.preparation_instructions,
          is_active: scan.is_active,
          created_at: scan.created_at,
          centre_pricing: [],
        });
      });

      // Then, add pricing to scans
      pricingData?.forEach((pricing: any) => {
        const scan = scansMap.get(pricing.item_id);
        if (scan) {
          scan.centre_pricing?.push({
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

      setScans(Array.from(scansMap.values()));
    } catch (error) {
      console.error('Error fetching scans:', error);
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

  const filteredScans = scans.filter(scan =>
    scan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    scan.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleScanStatus = async (scanId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('scans')
        .update({ is_active: !currentStatus })
        .eq('id', scanId);

      if (error) throw error;
      fetchScans();
    } catch (error) {
      console.error('Error updating scan status:', error);
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
              placeholder="Search scans..."
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
          Add Scan
        </button>
      </div>

      {/* Add Scan Modal */}
      <AddScanModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          fetchScans();
          setShowAddForm(false);
        }}
        centres={centres}
      />

      {/* Scans List */}
      <div className="space-y-4">
        {filteredScans.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <ScanLine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No scans found</p>
          </div>
        ) : (
          filteredScans.map((scan) => (
            <div
              key={scan.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              {/* Scan Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ScanLine className="w-6 h-6 text-purple-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">{scan.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{scan.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      scan.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {scan.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <button
                      onClick={() => toggleScanStatus(scan.id, scan.is_active)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        scan.is_active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {scan.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
                {scan.description && (
                  <p className="text-gray-600 mt-2">{scan.description}</p>
                )}
              </div>

              {/* Centre Pricing */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Centre Pricing</h4>
                {scan.centre_pricing && scan.centre_pricing.length > 0 ? (
                  <div className="space-y-3">
                    {scan.centre_pricing.map((pricing) => (
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
