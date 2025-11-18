'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AddPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  centres: any[];
}

export function AddPackageModal({ isOpen, onClose, onSuccess, centres }: AddPackageModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    tests_included: '',
    popular: false,
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('item_type', 'package')
        .eq('is_active', true)
        .order('display_order')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create package
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .insert({
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id || null,
          tests_included: formData.tests_included ? parseInt(formData.tests_included) : null,
          popular: formData.popular,
          is_active: true,
        })
        .select()
        .single();

      if (packageError) throw packageError;

      // Create centre pricing for all centres
      if (centres.length > 0 && packageData) {
        const pricingInserts = centres.map((centre) => ({
          centre_id: centre.id,
          item_type: 'package',
          item_id: packageData.id,
          price: 0, // Default price, can be edited later
          report_delivery_time: '24 hours',
          home_collection: false,
          is_active: true,
        }));

        const { error: pricingError } = await supabase
          .from('centre_pricing')
          .insert(pricingInserts);

        if (pricingError) throw pricingError;
      }

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: '',
        description: '',
        category_id: '',
        tests_included: '',
        popular: false,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to create package');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Add New Package</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Package Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Full Body Checkup"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select category (optional)</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Package description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tests Included
            </label>
            <input
              type="number"
              value={formData.tests_included}
              onChange={(e) => setFormData({ ...formData, tests_included: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Number of tests included"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="popular"
              checked={formData.popular}
              onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="popular" className="text-sm font-medium text-gray-700">
              Mark as Popular Package
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-medium"
            >
              {loading ? 'Creating...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

