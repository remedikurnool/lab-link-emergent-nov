'use client';

const categories = [
  { id: 1, name: 'Full Body Checkup', icon: '🩺', color: 'bg-purple-100' },
  { id: 2, name: 'Diabetes', icon: '🩸', color: 'bg-blue-100' },
  { id: 3, name: 'Vitamins', icon: '💊', color: 'bg-yellow-100' },
  { id: 4, name: 'Scans', icon: '☢️', color: 'bg-teal-100' },
];

export function CategoryIcons() {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
      <div className="grid grid-cols-4 gap-4">
        {categories.map((category) => (
          <button
            key={category.id}
            className="flex flex-col items-center gap-2 group"
          >
            <div
              className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform`}
            >
              <span className="text-3xl">{category.icon}</span>
            </div>
            <span className="text-xs font-medium text-gray-700 text-center">
              {category.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
