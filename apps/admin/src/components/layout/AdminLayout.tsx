'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '../auth/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Package,
  Settings,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/partners', label: 'Partners', icon: Users },
  { href: '/bookings', label: 'Bookings', icon: Calendar },
  { href: '/commissions', label: 'Commissions', icon: DollarSign },
  { href: '/centres', label: 'Centres', icon: MapPin },
  { href: '/catalogue', label: 'Catalogue', icon: Package },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const { signOut, adminUser } = useAuth();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const closeMobileSidebar = () => {
    if (isMobile) {
      setSidebarCollapsed(true);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Overlay for Mobile */}
        {isMobile && !sidebarCollapsed && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={closeMobileSidebar}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'w-16' : 'w-64'}
          ${isMobile && sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
          md:relative md:translate-x-0
        `}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">Lab Link Admin</span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-500" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={closeMobileSidebar}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
                        ${isActive
                          ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }
                        ${sidebarCollapsed ? 'justify-center' : ''}
                      `}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={async () => {
                await signOut();
                closeMobileSidebar();
              }}
              className={`
                flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-colors
                text-gray-700 hover:bg-red-50 hover:text-red-600
                ${sidebarCollapsed ? 'justify-center' : ''}
              `}
              title={sidebarCollapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Header */}
          <header className="bg-white border-b border-gray-200">
            <div className="flex items-center justify-between px-4 py-3">
              {/* Mobile Menu Button */}
              <button
                onClick={toggleSidebar}
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-500" />
              </button>

              {/* User Info */}
              <div className="flex-1 md:flex-initial md:ml-0 ml-4">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {adminUser?.email || 'Admin User'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {adminUser?.email?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}

