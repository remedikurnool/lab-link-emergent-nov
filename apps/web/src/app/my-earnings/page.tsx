'use client';

import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useBookingStore } from '@/store/bookingStore';
import { TrendingUp, Wallet, Clock, CheckCircle, DollarSign } from 'lucide-react';

export default function MyEarningsPage() {
  const { bookings } = useBookingStore();

  // Calculate commissions (10% of each booking)
  const COMMISSION_PERCENTAGE = 10;

  const calculateCommission = (amount: number) => {
    return (amount * COMMISSION_PERCENTAGE) / 100;
  };

  const totalEarnings = bookings.reduce(
    (total, booking) => total + calculateCommission(booking.totalAmount),
    0
  );

  const pendingEarnings = bookings
    .filter((b) => b.status === 'pending' || b.status === 'confirmed')
    .reduce((total, booking) => total + calculateCommission(booking.totalAmount), 0);

  const approvedEarnings = bookings
    .filter((b) => b.status === 'completed')
    .reduce((total, booking) => total + calculateCommission(booking.totalAmount), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Earnings</h1>
            <p className="text-sm text-gray-600">
              Track your commissions and payouts
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Earnings */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5" />
                <span className="text-sm font-medium opacity-90">Total Earnings</span>
              </div>
              <div className="text-3xl font-bold mb-1">₹{totalEarnings.toFixed(2)}</div>
              <div className="text-xs opacity-80">
                {COMMISSION_PERCENTAGE}% commission on bookings
              </div>
            </div>

            {/* Pending */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-600">Pending</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{pendingEarnings.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Awaiting approval</div>
            </div>

            {/* Approved */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-600">Approved</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{approvedEarnings.toFixed(2)}
              </div>
              <div className="text-xs text-gray-500">Ready for payout</div>
            </div>
          </div>

          {/* Commission Breakdown */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">Commission Breakdown</h2>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No bookings yet. Start booking to earn commissions!
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => {
                  const commission = calculateCommission(booking.totalAmount);
                  return (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 mb-1">
                          {booking.id}
                        </div>
                        <div className="text-sm text-gray-600">
                          {booking.items.length} test{booking.items.length > 1 ? 's' : ''} •{' '}
                          {booking.patient.fullName}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 mb-1">Commission</div>
                        <div className="text-lg font-bold text-green-600">
                          ₹{commission.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {COMMISSION_PERCENTAGE}% of ₹{booking.totalAmount}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payout Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-blue-900">Payout Information</h3>
            </div>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>• Commissions are calculated automatically on confirmed bookings</li>
              <li>• Payouts are processed weekly by admin</li>
              <li>• Add your bank/UPI details in profile for faster payouts</li>
              <li>• Minimum payout threshold: ₹500</li>
            </ul>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
