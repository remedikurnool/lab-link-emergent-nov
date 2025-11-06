'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash } from 'lucide-react';

export default function CentresPage() {
  const [centres, setCentres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    phone: '',
    address: '',
    rating: 4.5,
  });

  useEffect(() => {
    fetchCentres();
  }, []);

  const fetchCentres = async () => {
    try {
      const { data, error } = await supabase
        .from('diagnostic_centres')
        .select('*')
        .order('name');

      if (error) throw error;
      setCentres(data || []);
    } catch (error) {
      console.error('Error fetching centres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCentre = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('diagnostic_centres')
        .insert([formData]);

      if (error) throw error;
      
      setFormData({ name: '', city: '', phone: '', address: '', rating: 4.5 });
      setShowAddForm(false);
      fetchCentres();
    } catch (error) {
      console.error('Error adding centre:', error);
    }
  };

  const toggleCentreStatus = async (centreId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('diagnostic_centres')
        .update({ is_active: !currentStatus })
        .eq('id', centreId);

      if (error) throw error;
      fetchCentres();
    } catch (error) {
      console.error('Error updating centre:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Diagnostic Centres</h1>
              <p className="text-sm text-gray-600">Manage diagnostic centres</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">{centres.length} Centres</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg"
          >
            <Plus className="w-4 h-4" />
            Add Centre
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Add New Centre</h3>
            <form onSubmit={handleAddCentre} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Centre Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <input
                  type="number"
                  step="0.1"
                  placeholder="Rating"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg"
                >
                  Add Centre
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {centres.map((centre) => (
              <div
                key={centre.id}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1\">
                      {centre.name}
                    </h3>
                    <p className="text-sm text-gray-600">{centre.city}</p>
                    <p className="text-sm text-gray-600">{centre.phone}</p>
                    <div className="mt-2 text-sm">
                      <span className="text-yellow-500">★</span> {centre.rating}
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCentreStatus(centre.id, centre.is_active)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      centre.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {centre.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>
                <div className="text-sm text-gray-600">{centre.address}</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
