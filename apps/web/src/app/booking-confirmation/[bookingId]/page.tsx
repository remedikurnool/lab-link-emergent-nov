'use client';

import { use, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { usePartnerBookings } from '@/hooks/use-supabase-queries';
import { PaymentHistory } from '@/components/booking/PaymentHistory';
import { CheckCircle, Calendar, MapPin, Phone, Mail, Download, Home, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';

export default function BookingConfirmationPage(props: {
  params: Promise<{ bookingId: string }>;
}) {
  const params = use(props.params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentCancelled = searchParams?.get('payment') === 'cancelled';
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: bookings = [] } = usePartnerBookings();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        // First try to get from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError('Please login to view booking details');
          setLoading(false);
          return;
        }

        // Get partner ID
        const { data: partner } = await supabase
          .from('partners')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!partner) {
          setError('Partner profile not found');
          setLoading(false);
          return;
        }

        // Fetch booking from Supabase
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select(`
            *,
            patients(*)
          `)
          .eq('id', params.bookingId)
          .eq('partner_id', partner.id)
          .single();

        if (bookingError) {
          // Try to find in bookings list from hook
          const foundBooking = bookings.find(b => b.id === params.bookingId);
          if (foundBooking) {
            setBooking(foundBooking);
          } else {
            setError('Booking not found');
          }
        } else if (bookingData) {
          // Transform Supabase booking to match component expectations
          const transformedBooking = {
            id: bookingData.id,
            patient: {
              fullName: bookingData.patients?.full_name || 'N/A',
              age: bookingData.patients?.age || 0,
              gender: bookingData.patients?.gender || 'N/A',
              phone: bookingData.patients?.phone || 'N/A',
              email: bookingData.patients?.email || null,
            },
            collection: {
              type: bookingData.collection_type,
              date: bookingData.collection_date,
              timeSlot: bookingData.time_slot,
              address: bookingData.collection_address,
              city: bookingData.collection_city,
              pincode: bookingData.collection_pincode,
              landmark: bookingData.collection_landmark,
            },
            items: bookingData.items || [],
            totalAmount: parseFloat(bookingData.total_amount?.toString() || '0'),
            paymentMethod: bookingData.payment_method,
            status: bookingData.status,
            paymentStatus: bookingData.payment_status,
            createdAt: bookingData.created_at,
          };
          setBooking(transformedBooking);
        }
      } catch (err: any) {
        console.error('Error fetching booking:', err);
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [params.bookingId, bookings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="pb-20 md:pb-8">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading booking details...</p>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="pb-20 md:pb-8">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Booking Not Found
              </h1>
              <Link
                href="/"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Go to Home
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
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            {/* Success Message */}
            <div className={`rounded-2xl p-8 border text-center mb-6 ${
              paymentCancelled || booking.paymentStatus === 'failed'
                ? 'bg-orange-50 border-orange-200'
                : booking.paymentStatus === 'success' || booking.status === 'confirmed'
                ? 'bg-green-50 border-green-200'
                : 'bg-white border-gray-200'
            }`}>
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                paymentCancelled || booking.paymentStatus === 'failed'
                  ? 'bg-orange-100'
                  : booking.paymentStatus === 'success' || booking.status === 'confirmed'
                  ? 'bg-green-100'
                  : 'bg-yellow-100'
              }`}>
                {paymentCancelled || booking.paymentStatus === 'failed' ? (
                  <AlertCircle className="w-12 h-12 text-orange-600" />
                ) : booking.paymentStatus === 'success' || booking.status === 'confirmed' ? (
                  <CheckCircle className="w-12 h-12 text-green-600" />
                ) : (
                  <Loader2 className="w-12 h-12 text-yellow-600 animate-spin" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {paymentCancelled || booking.paymentStatus === 'failed'
                  ? 'Payment Pending'
                  : booking.paymentStatus === 'success' || booking.status === 'confirmed'
                  ? 'Booking Confirmed!'
                  : 'Booking Pending'}
              </h1>
              <p className="text-gray-600 mb-6">
                {paymentCancelled
                  ? 'Your payment was cancelled. Please complete payment to confirm your booking.'
                  : booking.paymentStatus === 'failed'
                  ? 'Payment failed. Please try again or contact support.'
                  : booking.paymentStatus === 'success' || booking.status === 'confirmed'
                  ? 'Your booking has been successfully placed'
                  : 'Your booking is being processed. Please complete payment to confirm.'}
              </p>
              <div className="inline-block bg-primary-50 px-6 py-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Booking ID</div>
                <div className="text-2xl font-bold text-primary-600">
                  {booking.id}
                </div>
              </div>
              {paymentCancelled && booking.paymentMethod === 'prepaid' && (
                <div className="mt-4">
                  <Link
                    href={`/checkout?bookingId=${booking.id}`}
                    className="inline-block px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Complete Payment
                  </Link>
                </div>
              )}
            </div>

            {/* Booking Details */}
            <div className="bg-white rounded-xl p-6 border border-gray-200 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Booking Details
              </h2>

              {/* Patient Info */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Patient Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Name:</span>
                    <span className="font-semibold">
                      {booking.patient.fullName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4" />
                    <span className="text-gray-600">Age / Gender:</span>
                    <span className="font-semibold">
                      {booking.patient.age} years / {booking.patient.gender}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold">{booking.patient.phone}</span>
                  </div>
                  {booking.patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold">
                        {booking.patient.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Collection Details */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Collection Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold">
                      {booking.collection.type === 'home'
                        ? 'Home Collection'
                        : 'Lab Visit'}
                    </span>
                  </div>
                  {booking.collection.type === 'home' &&
                    booking.collection.address && (
                      <div className="flex items-start gap-2">
                        <span className="w-4" />
                        <span className="text-gray-600">Address:</span>
                        <div className="flex-1">
                          <div className="font-semibold">
                            {booking.collection.address}
                          </div>
                          <div className="text-gray-600">
                            {booking.collection.city}, {booking.collection.pincode}
                          </div>
                        </div>
                      </div>
                    )}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Date:</span>
                    <span className="font-semibold">
                      {booking.collection.date
                        ? formatDate(booking.collection.date)
                        : 'Not scheduled'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4" />
                    <span className="text-gray-600">Time Slot:</span>
                    <span className="font-semibold capitalize">
                      {booking.collection.timeSlot}
                    </span>
                  </div>
                </div>
              </div>

              {/* Tests Booked */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Tests / Scans Booked
                </h3>
                <div className="space-y-2">
                  {booking.items.map((item: any) => (
                    <div
                      key={`${item.id}-${item.diagnosticCenterId}`}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item.diagnosticCenterName}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">₹{item.price}</div>
                        <div className="text-sm text-gray-600">
                          Qty: {item.quantity}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-600">
                    ₹{booking.totalAmount}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Payment Method:{' '}
                  <span className="font-semibold">
                    {booking.paymentMethod === 'pay_at_lab'
                      ? `Pay at ${
                          booking.collection.type === 'home' ? 'Home' : 'Lab'
                        }`
                      : 'Prepaid'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment History */}
            {booking.paymentMethod === 'prepaid' && (
              <PaymentHistory bookingId={params.bookingId} />
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-blue-900 mb-3">What's Next?</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    You will receive a confirmation SMS/Email shortly
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    Our phlebotomist will{' '}
                    {booking.collection.type === 'home' ? 'visit you' : 'be ready'}{' '}
                    at the scheduled time
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>
                    Report will be uploaded in "My Bookings" section
                  </span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Link
                href="/my-bookings"
                className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors text-center"
              >
                View My Bookings
              </Link>
              <Link
                href="/"
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-colors text-center flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
