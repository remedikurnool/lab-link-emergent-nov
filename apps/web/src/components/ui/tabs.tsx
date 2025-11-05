'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface TabsProps {
  tabs: string[];
  defaultTab?: string;
  onTabChange?: (tab: string) => void;
}

export function Tabs({ tabs, defaultTab, onTabChange }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  return (
    <div className="flex gap-2 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => handleTabClick(tab)}
          className={cn(
            'px-4 py-3 font-semibold text-sm transition-colors relative',
            activeTab === tab
              ? 'text-primary-600'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600" />
          )}
        </button>
      ))}
    </div>
  );
}
