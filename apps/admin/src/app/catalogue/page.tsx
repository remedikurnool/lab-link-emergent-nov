'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TestsSection } from '@/components/catalogue/TestsSection';
import { ScansSection } from '@/components/catalogue/ScansSection';
import { PackagesSection } from '@/components/catalogue/PackagesSection';
import { CentresSection } from '@/components/catalogue/CentresSection';
import { CategoriesSection } from '@/components/catalogue/CategoriesSection';
import { TestTube, ScanLine, Package, MapPin, Tag } from 'lucide-react';

export default function CataloguePage() {
  const [activeTab, setActiveTab] = useState<'tests' | 'scans' | 'packages' | 'centres' | 'categories'>('tests');

  const tabs = [
    { id: 'tests' as const, name: 'Tests', icon: TestTube, component: TestsSection },
    { id: 'scans' as const, name: 'Scans', icon: ScanLine, component: ScansSection },
    { id: 'packages' as const, name: 'Packages', icon: Package, component: PackagesSection },
    { id: 'centres' as const, name: 'Centres', icon: MapPin, component: CentresSection },
    { id: 'categories' as const, name: 'Categories', icon: Tag, component: CategoriesSection },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || TestsSection;

  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Catalogue Management</h2>
        <p className="text-gray-600">Manage tests, scans, packages, and diagnostic centres</p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Active Component */}
      <ActiveComponent />
    </AdminLayout>
  );
}
