'use client';

import { useDiagnosticCentres } from '@/hooks/use-supabase-queries';
import { Plus, Edit, Trash2, Search, MapPin, Phone, Mail, Star } from 'lucide-react';
import { AddCentreModal } from './AddCentreModal';

interface Centre {
  id: string;
  name: string;
  city: string;
  phone?: string;
  address?: string;
  rating: number;
  is_active: boolean;
  created_at: string;
  test_count?: number;
  scan_count?: number;
  package_count?: number;
}

export function CentresSection() {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCentre, setEditingCentre] = useState<Centre | null>(null);

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      // First get centres
      const { data: centresData, error: centresError } = await supabase
        .from('diagnostic_centres')
        .select('*')
        .order('name');

      if (centresError) throw centresError;

      // Then get counts for each centre
      const centresWithCounts = await Promise.all(
        (centresData || []).map(async (centre) => {
          const [testCount, scanCount, packageCount] = await Promise.all([
            supabase
              .from('centre_pricing')
              .select('id', { count: 'exact', head: true })
              .eq('centre_id', centre.id)
              .eq('item_type', 'test')
              .eq('is_active', true),
            supabase
              .from('centre_pricing')
              .select('id', { count: 'exact', head: true })
              .eq('centre_id', centre.id)
              .eq('item_type', 'scan')
              .eq('is_active', true),
            supabase
              .from('centre_pricing')
              .select('id', { count: 'exact', head: true })
              .eq('centre_id', centre.id)
              .eq('item_type', 'package')
              .eq('is_active', true),
          ]);

          return {
            ...centre,
            test_count: testCount.count || 0,
            scan_count: scanCount.count || 0,
            package_count: packageCount.count || 0,
          };
        })
      );

      setCentres(centresWithCounts);
    } catch (error) {
      console.error('Error fetching centres:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCentres = centres.filter(centre =>
    centre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    centre.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleCentreStatus = async (centreId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('diagnostic_centres')
        .update({ is_active: !currentStatus })
        .eq('id', centreId);

      if (error) throw error;
      fetchCentres();
    } catch (error) {
      console.error('Error updating centre status:', error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
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
              placeholder="Search centres..."
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
          Add Centre
        </button>
      </div>

      {/* Add Centre Modal */}
      <AddCentreModal
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={() => {
          fetchCentres();
          setShowAddForm(false);
        }}
      />

      {/* Centres Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCentres.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-gray-200">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No centres found</p>
          </div>
        ) : (
          filteredCentres.map((centre) => (
            <div
              key={centre.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Centre Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-green-600" />
                    <div>
                      <h3 className="font-bold text-gray-900">{centre.name}</h3>
                      <p className="text-sm text-gray-600">{centre.city}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    centre.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {centre.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">{renderStars(centre.rating)}</div>
                  <span className="text-sm text-gray-600">({centre.rating}/5)</span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  {centre.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{centre.phone}</span>
                    </div>
                  )}
                  {centre.address && (
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">Address:</div>
                      <div className="text-xs">{centre.address}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistics */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Catalogue Overview</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{centre.test_count || 0}</div>
                    <div className="text-xs text-gray-600">Tests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{centre.scan_count || 0}</div>
                    <div className="text-xs text-gray-600">Scans</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{centre.package_count || 0}</div>
                    <div className="text-xs text-gray-600">Packages</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="px-6 pb-6">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleCentreStatus(centre.id, centre.is_active)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      centre.is_active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {centre.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-sm font-medium">
                    Edit Centre
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
