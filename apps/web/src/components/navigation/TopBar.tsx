'use client';

import Link from 'next/link';
import { Menu, ShoppingCart, Bell } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

export function TopBar() {
  const { getTotalItems } = useCartStore();
  const cartCount = getTotalItems();

  return (
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

          {/* Right side icons */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
