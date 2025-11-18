'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ShoppingCart, Bell, X, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import { MobileSidebar } from './MobileSidebar';
import { MegaMenu } from './MegaMenu';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function TopBar() {
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const isTestsPage = pathname.startsWith('/tests');
  const isScansPage = pathname.startsWith('/scans');
  const isPackagesPage = pathname.startsWith('/packages');

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMenuMouseEnter = useCallback(() => {
    // Clear any pending close timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setIsMegaMenuOpen(true);
  }, []);

  const handleMenuMouseLeave = useCallback(() => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Delay closing to allow moving to menu
    hoverTimeoutRef.current = setTimeout(() => {
      setIsMegaMenuOpen(false);
      hoverTimeoutRef.current = null;
    }, 150);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const handleMegaMenuClose = useCallback(() => {
    setIsMegaMenuOpen(false);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                Lab Link
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
              <Link
                href="/"
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname === '/'
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                Home
              </Link>
              
              <div
                className="relative"
                onMouseEnter={handleMenuMouseEnter}
                onMouseLeave={handleMenuMouseLeave}
              >
                <button
                  ref={menuTriggerRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle menu on click for better UX
                    setIsMegaMenuOpen((prev) => !prev);
                  }}
                  className={cn(
                    'flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isTestsPage || isScansPage || isPackagesPage || isMegaMenuOpen
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  )}
                  aria-expanded={isMegaMenuOpen}
                  aria-haspopup="true"
                >
                  Services
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform duration-200',
                      isMegaMenuOpen ? 'rotate-180' : ''
                    )}
                  />
                </button>
              </div>

              <Link
                href="/my-bookings"
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname.startsWith('/my-bookings')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                My Bookings
              </Link>

              <Link
                href="/my-profile"
                className={cn(
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                  pathname.startsWith('/my-profile')
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
              >
                Profile
              </Link>
            </nav>

            {/* Right side icons */}
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors hidden md:block">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(true);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
                aria-label="Open menu"
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 text-gray-600" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileMenuOpen}
        onClose={handleMobileMenuClose}
      />

      {/* Desktop Mega Menu */}
      <MegaMenu
        isOpen={isMegaMenuOpen}
        onClose={handleMegaMenuClose}
        triggerRef={menuTriggerRef}
      />
    </>
  );
}
