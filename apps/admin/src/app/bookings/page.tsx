'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, Filter } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    try {
      let query = supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', bookingId);

      if (error) throw error;
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Bookings Management</h1>
              <p className="text-sm text-gray-600">Manage all platform bookings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <span className="text-sm text-gray-600">
            {bookings.length} bookings found
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-xl p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{booking.id}</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(booking.created_at)} • {booking.collection_type === 'home' ? 'Home Collection' : 'Lab Visit'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      booking.status
                    )}`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Items</div>
                    <div className="font-semibold text-gray-900">
                      {booking.items?.length || 0} tests/scans
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Total Amount</div>
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(parseFloat(booking.total_amount))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Commission</div>
                    <div className="font-semibold text-green-600">
                      {formatCurrency(parseFloat(booking.partner_commission || 0))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {booking.status === 'pending' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg text-sm"
                    >
                      Confirm
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'completed')}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg text-sm"
                    >
                      Mark Complete
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                      className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
