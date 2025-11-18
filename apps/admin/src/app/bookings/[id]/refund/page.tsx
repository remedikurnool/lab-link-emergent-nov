'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RefundButton } from '@/components/bookings/RefundButton';
import { ArrowLeft, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function RefundPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;

    const fetchBooking = async () => {
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (error) throw error;
        setBooking(data);
      } catch (error) {
        console.error('Error fetching booking:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">The booking you are looking for does not exist.</p>
          <Link href="/bookings">
            <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg">
              Back to Bookings
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (booking.payment_status !== 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-orange-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cannot Refund</h1>
          <p className="text-gray-600 mb-6">
            This booking does not have a successful payment. Only successful payments can be refunded.
          </p>
          <Link href="/bookings">
            <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg">
              Back to Bookings
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/bookings" className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Process Refund</h1>
              <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-mono text-sm">{booking.payment_id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Gateway:</span>
                <span className="capitalize font-semibold">{booking.payment_gateway || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className={`font-semibold ${
                  booking.payment_status === 'success' ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {booking.payment_status?.toUpperCase() || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="text-xl font-bold text-primary-600">
                  ₹{parseFloat(booking.total_amount || 0).toFixed(2)}
                </span>
              </div>
              {booking.payment_timestamp && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Date:</span>
                  <span className="text-sm">
                    {new Date(booking.payment_timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-6">
              <RefundButton
                bookingId={booking.id}
                paymentId={booking.payment_id}
                paymentGateway={booking.payment_gateway}
                amount={parseFloat(booking.total_amount || 0)}
                onRefundComplete={() => router.push('/bookings')}
              />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold mb-1">Important Notes:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Refunds may take 5-7 business days to process</li>
                  <li>The refund will be credited to the original payment method</li>
                  <li>Once processed, this action cannot be undone</li>
                  <li>Please verify the booking details before processing the refund</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

