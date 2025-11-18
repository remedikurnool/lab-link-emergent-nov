'use client';

import { useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { X, Home, FlaskConical, Scan, Package, Calendar, User, ShoppingCart, Bell, Settings, LogOut, Heart, TrendingUp, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCartStore } from '@/store/cartStore';
import { useAuth } from '@/hooks/use-auth';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const mainNavItems = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: FlaskConical, label: 'Tests', href: '/tests' },
  { icon: Scan, label: 'Scans', href: '/scans' },
  { icon: Package, label: 'Packages', href: '/packages' },
];

const userNavItems = [
  { icon: Calendar, label: 'My Bookings', href: '/my-bookings' },
  { icon: Heart, label: 'My Earnings', href: '/my-earnings' },
  { icon: User, label: 'My Profile', href: '/my-profile' },
  { icon: FileText, label: 'Reports', href: '/reports' },
];

const categoryItems = [
  { label: 'Full Body Checkup', href: '/packages?category=full-body', color: 'text-purple-600' },
  { label: 'Diabetes Tests', href: '/tests?category=diabetes', color: 'text-blue-600' },
  { label: 'Vitamin Tests', href: '/tests?category=vitamins', color: 'text-yellow-600' },
  { label: 'CT Scans', href: '/scans?category=ct', color: 'text-teal-600' },
  { label: 'MRI Scans', href: '/scans?category=mri', color: 'text-indigo-600' },
  { label: 'Ultrasound', href: '/scans?category=ultrasound', color: 'text-green-600' },
];

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const { getTotalItems } = useCartStore();
  const { user, signOut } = useAuth();
  const cartCount = getTotalItems();
  const previousPathname = useRef(pathname);

  // Close sidebar on route change (only if pathname actually changed)
  useEffect(() => {
    if (isOpen && pathname !== previousPathname.current) {
      previousPathname.current = pathname;
      // Small delay to allow navigation to complete
      const timer = setTimeout(() => {
        onClose();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [pathname, isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    onClose();
    await signOut();
  };

  // Always render but control visibility to prevent layout shifts
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out"
          onClick={onClose}
          aria-hidden={false}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:hidden overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!isOpen}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          visibility: isOpen ? 'visible' : 'hidden',
          willChange: 'transform'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-white font-bold text-lg">Lab Link</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user.email || 'User'}
                </p>
                <p className="text-xs text-gray-500">Partner Account</p>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/cart"
              onClick={onClose}
              className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Cart</p>
                {cartCount > 0 && (
                  <p className="text-xs text-gray-500">{cartCount} items</p>
                )}
              </div>
              {cartCount > 0 && (
                <span className="w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">3 new</p>
              </div>
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Main Menu
          </p>
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Categories */}
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Popular Categories
          </p>
          <div className="space-y-1">
            {categoryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'block px-4 py-2 text-sm rounded-lg hover:bg-gray-50 transition-colors',
                  item.color
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* User Navigation */}
        {user && (
          <nav className="p-4 border-t border-gray-200 space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              My Account
            </p>
            {userNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary-50 text-primary-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        )}

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
            >
              <span>Login</span>
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}

