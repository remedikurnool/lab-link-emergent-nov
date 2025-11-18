'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CategoriesSection } from '@/components/catalogue/CategoriesSection';

export default function CategoriesPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Category Management</h2>
        <p className="text-gray-600">Manage categories for tests, scans, and packages</p>
      </div>
      <CategoriesSection />
    </AdminLayout>
  );
}

