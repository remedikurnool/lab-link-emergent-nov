'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FlaskConical,
  Scan,
  Package,
  ChevronDown,
  Heart,
  TrendingUp,
  FileText,
  Stethoscope,
  Activity,
  Brain,
  TestTube2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  badge?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuData: Record<string, MenuSection[]> = {
  tests: [
    {
      title: 'Popular Tests',
      items: [
        { label: 'Complete Blood Count (CBC)', href: '/tests?category=blood', icon: TestTube2, description: 'Comprehensive blood analysis' },
        { label: 'Diabetes Profile', href: '/tests?category=diabetes', icon: Activity, description: 'HbA1c, FBS, PPBS' },
        { label: 'Thyroid Profile', href: '/tests?category=thyroid', icon: Brain, description: 'TSH, T3, T4 levels' },
        { label: 'Lipid Profile', href: '/tests?category=lipid', icon: Heart, description: 'Cholesterol & triglycerides' },
      ],
    },
    {
      title: 'By Category',
      items: [
        { label: 'Blood Tests', href: '/tests?category=blood' },
        { label: 'Diabetes Tests', href: '/tests?category=diabetes' },
        { label: 'Hormone Tests', href: '/tests?category=hormone' },
        { label: 'Vitamin Tests', href: '/tests?category=vitamins' },
        { label: 'Liver Function', href: '/tests?category=liver' },
        { label: 'Kidney Function', href: '/tests?category=kidney' },
      ],
    },
  ],
  scans: [
    {
      title: 'Popular Scans',
      items: [
        { label: 'CT Scan', href: '/scans?category=ct', icon: Scan, description: 'Computed Tomography' },
        { label: 'MRI Scan', href: '/scans?category=mri', icon: Brain, description: 'Magnetic Resonance Imaging' },
        { label: 'Ultrasound', href: '/scans?category=ultrasound', icon: Activity, description: 'Sonography' },
        { label: 'X-Ray', href: '/scans?category=xray', icon: Scan, description: 'Radiography' },
      ],
    },
    {
      title: 'By Body Part',
      items: [
        { label: 'Head & Neck', href: '/scans?category=head-neck' },
        { label: 'Chest', href: '/scans?category=chest' },
        { label: 'Abdomen', href: '/scans?category=abdomen' },
        { label: 'Pelvis', href: '/scans?category=pelvis' },
        { label: 'Spine', href: '/scans?category=spine' },
        { label: 'Limbs', href: '/scans?category=limbs' },
      ],
    },
  ],
  packages: [
    {
      title: 'Health Packages',
      items: [
        { label: 'Full Body Checkup', href: '/packages?category=full-body', icon: Stethoscope, description: 'Comprehensive health screening', badge: 'Popular' },
        { label: 'Diabetes Profile', href: '/packages?category=diabetes', icon: Activity, description: 'Complete diabetes management' },
        { label: 'Heart Health', href: '/packages?category=heart', icon: Heart, description: 'Cardiac screening package' },
        { label: 'Women\'s Health', href: '/packages?category=womens', icon: Heart, description: 'Specialized women care' },
      ],
    },
    {
      title: 'By Age Group',
      items: [
        { label: 'Senior Citizen', href: '/packages?age=senior', badge: 'Best Value' },
        { label: 'Adults (30-50)', href: '/packages?age=adult' },
        { label: 'Young Adults (18-30)', href: '/packages?age=young' },
        { label: 'Kids & Teens', href: '/packages?age=kids' },
      ],
    },
  ],
};

interface MegaMenuProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement>;
}

export function MegaMenu({ isOpen, onClose, triggerRef }: MegaMenuProps) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          menuRef.current &&
          !menuRef.current.contains(event.target as Node) &&
          triggerRef?.current &&
          !triggerRef.current.contains(event.target as Node)
        ) {
          onClose();
        }
      };

      // Use capture phase to catch events earlier
      document.addEventListener('mousedown', handleClickOutside, true);
      return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }
  }, [isOpen, onClose, triggerRef]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const mainMenuItems = [
    {
      label: 'Tests',
      key: 'tests',
      icon: FlaskConical,
      href: '/tests',
    },
    {
      label: 'Scans',
      key: 'scans',
      icon: Scan,
      href: '/scans',
    },
    {
      label: 'Packages',
      key: 'packages',
      icon: Package,
      href: '/packages',
    },
  ];

  const handleMenuHover = useCallback((key: string | null) => {
    // Clear any pending timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveMenu(key);
  }, []);

  const handleMenuLeave = useCallback(() => {
    // Small delay before clearing active menu to prevent flickering
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
      hoverTimeoutRef.current = null;
    }, 100);
  }, []);

  const activeMenuData = useMemo(() => {
    return activeMenu ? menuData[activeMenu] : null;
  }, [activeMenu]);

  // Always render but control visibility to prevent flickering
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 hidden md:block transition-opacity duration-200 ease-in-out"
          onClick={onClose}
          aria-hidden={false}
        />
      )}

      {/* Mega Menu */}
      <div
        ref={menuRef}
        className={cn(
          'fixed top-16 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-xl hidden md:block transition-all duration-200 ease-in-out',
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        )}
        onMouseLeave={handleMenuLeave}
        onMouseEnter={() => {
          // Clear timeout when mouse enters menu
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
        }}
        aria-hidden={!isOpen}
        style={{ 
          visibility: isOpen ? 'visible' : 'hidden',
          willChange: 'transform, opacity'
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex">
            {/* Left Sidebar - Main Menu */}
            <div className="w-64 border-r border-gray-200 bg-gray-50">
              <div className="py-2">
                {mainMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname.startsWith(item.href);
                  const isHovered = activeMenu === item.key;

                  return (
                    <div
                      key={item.key}
                      onMouseEnter={() => handleMenuHover(item.key)}
                      onMouseLeave={() => {
                        // Only clear if not hovering over another menu item
                        if (activeMenu === item.key) {
                          handleMenuLeave();
                        }
                      }}
                      className="relative"
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 transition-colors',
                          isActive || isHovered
                            ? 'bg-white text-primary-600 font-semibold'
                            : 'text-gray-700 hover:bg-white hover:text-primary-600'
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 ml-auto transition-transform',
                            isHovered ? 'rotate-180' : ''
                          )}
                        />
                      </Link>
                      {isHovered && (
                        <div className="absolute left-full top-0 w-1 h-full bg-primary-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Content - Submenu */}
            {activeMenuData && (
              <div 
                className="flex-1 py-6 px-8"
                onMouseEnter={() => {
                  // Keep menu open when hovering over content
                  if (hoverTimeoutRef.current) {
                    clearTimeout(hoverTimeoutRef.current);
                    hoverTimeoutRef.current = null;
                  }
                }}
              >
                <div className="grid grid-cols-2 gap-8">
                  {activeMenuData.map((section, sectionIndex) => (
                    <div key={sectionIndex}>
                      <h3 className="text-sm font-semibold text-gray-900 mb-4 uppercase tracking-wide">
                        {section.title}
                      </h3>
                      <ul className="space-y-3">
                        {section.items.map((item, itemIndex) => {
                          const Icon = item.icon;
                          return (
                            <li key={itemIndex}>
                              <Link
                                href={item.href}
                                onClick={onClose}
                                className="group flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                {Icon && (
                                  <Icon className="w-5 h-5 text-gray-400 group-hover:text-primary-600 mt-0.5 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                                      {item.label}
                                    </span>
                                    {item.badge && (
                                      <span className="px-2 py-0.5 text-xs font-semibold bg-primary-100 text-primary-700 rounded-full">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* View All Link */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href={mainMenuItems.find((m) => m.key === activeMenu)?.href || '#'}
                    onClick={onClose}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700"
                  >
                    View All {mainMenuItems.find((m) => m.key === activeMenu)?.label}
                    <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                  </Link>
                </div>
              </div>
            )}

            {/* Default State - Show Categories */}
            {!activeMenuData && (
              <div className="flex-1 py-6 px-8">
                <div className="grid grid-cols-3 gap-6">
                  {mainMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={onClose}
                        className="group p-6 border border-gray-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="p-2 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                            <Icon className="w-6 h-6 text-primary-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">
                            {item.label}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          Browse our comprehensive collection of {item.label.toLowerCase()}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

