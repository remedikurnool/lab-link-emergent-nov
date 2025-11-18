'use client';

import { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Category {
  id: string;
  name: string;
  image_url?: string;
  item_type: 'test' | 'scan' | 'package';
  description?: string;
  is_active: boolean;
  display_order: number;
}

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCategory?: Category | null;
}

export function AddCategoryModal({ isOpen, onClose, onSuccess, editingCategory }: AddCategoryModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    item_type: 'test' as 'test' | 'scan' | 'package',
    description: '',
    display_order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        image_url: editingCategory.image_url || '',
        item_type: editingCategory.item_type,
        description: editingCategory.description || '',
        display_order: editingCategory.display_order,
      });
    } else {
      setFormData({
        name: '',
        image_url: '',
        item_type: 'test',
        description: '',
        display_order: 0,
      });
    }
  }, [editingCategory, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `category-${Date.now()}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (err: any) {
      console.error('Upload error:', err);
      // If storage fails, allow manual URL entry
      setError('Upload failed. You can enter image URL manually.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (editingCategory) {
        // Update existing category
        const { error: updateError } = await supabase
          .from('categories')
          .update({
            name: formData.name,
            image_url: formData.image_url || null,
            item_type: formData.item_type,
            description: formData.description || null,
            display_order: formData.display_order,
          })
          .eq('id', editingCategory.id);

        if (updateError) throw updateError;
      } else {
        // Create new category
        const { error: insertError } = await supabase
          .from('categories')
          .insert({
            name: formData.name,
            image_url: formData.image_url || null,
            item_type: formData.item_type,
            description: formData.description || null,
            display_order: formData.display_order,
            is_active: true,
          });

        if (insertError) throw insertError;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
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
              Category Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g., Blood Tests"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Item Type *
              </label>
              <select
                required
                value={formData.item_type}
                onChange={(e) => setFormData({ ...formData, item_type: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="test">Test</option>
                <option value="scan">Scan</option>
                <option value="package">Package</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Order
              </label>
              <input
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0"
              />
            </div>
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
              placeholder="Category description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image
            </label>
            <div className="space-y-3">
              {/* Image Preview */}
              {formData.image_url && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={formData.image_url}
                    alt="Category preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image_url: '' })}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                  <Upload className="w-4 h-4" />
                  {uploading ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <span className="text-sm text-gray-500">or</span>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Enter image URL"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                Upload an image or enter a URL. Recommended size: 400x300px
              </p>
            </div>
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
              disabled={loading || uploading}
              className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg font-medium"
            >
              {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

