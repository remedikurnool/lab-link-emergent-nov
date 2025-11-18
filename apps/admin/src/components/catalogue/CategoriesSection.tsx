'use client';

import { useCategories } from '@/hooks/use-supabase-queries';
import { Plus, Edit, Trash2, Search, Image as ImageIcon, Tag, X } from 'lucide-react';
import { AddCategoryModal } from './AddCategoryModal';

interface Category {
  id: string;
  name: string;
  image_url?: string;
  item_type: 'test' | 'scan' | 'package';
  description?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState<'all' | 'test' | 'scan' | 'package'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();

    // Set up real-time subscription for categories
    const channel = supabase
      .channel('categories-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = itemTypeFilter === 'all' || category.item_type === itemTypeFilter;
    return matchesSearch && matchesType;
  });

  const toggleCategoryStatus = async (categoryId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentStatus })
        .eq('id', categoryId);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? Items using this category will have their category set to null.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category. It may be in use by existing items.');
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={itemTypeFilter}
            onChange={(e) => setItemTypeFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Types</option>
            <option value="test">Tests</option>
            <option value="scan">Scans</option>
            <option value="package">Packages</option>
          </select>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setShowAddForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Add/Edit Category Modal */}
      <AddCategoryModal
        isOpen={showAddForm}
        onClose={() => {
          setShowAddForm(false);
          setEditingCategory(null);
        }}
        onSuccess={() => {
          fetchCategories();
          setShowAddForm(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
      />

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.length === 0 ? (
          <div className="col-span-full bg-white rounded-xl p-12 text-center border border-gray-200">
            <Tag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Category Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-primary-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {category.item_type.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Category Info */}
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-1">{category.name}</h3>
                {category.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{category.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                  <span>Order: {category.display_order}</span>
                  <span>•</span>
                  <span className={`${category.is_active ? 'text-green-600' : 'text-red-600'}`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingCategory(category);
                      setShowAddForm(true);
                    }}
                    className="flex-1 px-3 py-2 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleCategoryStatus(category.id, category.is_active)}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium ${
                      category.is_active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {category.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteCategory(category.id)}
                    className="px-3 py-2 bg-gray-50 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
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

