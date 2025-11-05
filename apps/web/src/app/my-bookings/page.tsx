'use client';

import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useBookingStore } from '@/store/bookingStore';
import { Calendar, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function MyBookingsPage() {
  const { bookings } = useBookingStore();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'cancelled':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="pb-20 md:pb-8">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto text-center">
              <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                No Bookings Yet
              </h1>
              <p className="text-gray-600 mb-6">
                Book your first test or scan to see your bookings here
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

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-sm text-gray-600">
              {bookings.length} booking{bookings.length > 1 ? 's' : ''} found
            </p>
          </div>

          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="font-bold text-gray-900 mb-1">
                      Booking ID: {booking.id}
                    </div>
                    <div className="text-sm text-gray-600">
                      Booked on{' '}
                      {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Patient</div>
                    <div className="font-semibold text-gray-900">
                      {booking.patient.fullName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {booking.patient.age} yrs, {booking.patient.gender}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                      <Calendar className="w-3 h-3" />
                      Collection Date
                    </div>
                    <div className="font-semibold text-gray-900">
                      {new Date(booking.collection.date).toLocaleDateString(
                        'en-IN',
                        { day: 'numeric', month: 'short' }
                      )}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {booking.collection.timeSlot}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-2">Tests Booked</div>
                  <div className="space-y-1">
                    {booking.items.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-sm text-gray-700 flex justify-between"
                      >
                        <span>{item.name}</span>
                        <span className="text-gray-500">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <div className="text-xs text-gray-500">Total Amount</div>
                    <div className="text-xl font-bold text-primary-600">
                      ₹{booking.totalAmount}
                    </div>
                  </div>
                  <Link
                    href={`/booking-confirmation/${booking.id}`}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors text-sm"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
