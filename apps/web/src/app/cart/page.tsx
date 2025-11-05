'use client';

import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useCartStore } from '@/store/cartStore';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="pb-20 md:pb-8">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto text-center">
              <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Your cart is empty
              </h1>
              <p className="text-gray-600 mb-6">
                Add tests, scans, or packages to get started
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
              >
                Browse Tests
              </Link>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-32 md:pb-8">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-600">
              {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} in cart
            </p>
          </div>

          {/* Cart Items */}
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={`${item.id}-${item.diagnosticCenterId}`}
                className="bg-white rounded-xl p-4 border border-gray-200"
              >
                <div className="flex gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {item.diagnosticCenterName}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>Report: {item.reportDeliveryTime}</span>
                      {item.testsIncluded && (
                        <span>{item.testsIncluded} tests included</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.id, item.diagnosticCenterId)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.diagnosticCenterId,
                          item.quantity - 1
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-semibold text-gray-900 w-8 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          item.diagnosticCenterId,
                          item.quantity + 1
                        )
                      }
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="text-right">
                    {item.originalPrice && (
                      <div className="text-xs text-gray-400 line-through">
                        ₹{item.originalPrice * item.quantity}
                      </div>
                    )}
                    <div className="text-lg font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Card (Desktop) */}
          <div className="hidden md:block bg-white rounded-xl p-6 border border-gray-200 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">₹{getTotalPrice()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Discount</span>
                <span className="font-semibold text-green-600">
                  -₹
                  {items.reduce(
                    (total, item) =>
                      total +
                      ((item.originalPrice || item.price) - item.price) *
                        item.quantity,
                    0
                  )}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ₹{getTotalPrice()}
                  </span>
                </div>
              </div>
            </div>
            <button className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition-colors">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </main>

      {/* Fixed Bottom Summary (Mobile) */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-200 p-4 md:hidden z-40">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-primary-600">
              ₹{getTotalPrice()}
            </div>
          </div>
          <button className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-lg transition-colors">
            Checkout
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
