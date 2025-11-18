'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';

interface PaymentStatus {
  id: string;
  booking_id: string;
  payment_gateway: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'refunded' | 'cancelled';
  amount: number;
  created_at: string;
  payment_response?: any;
}

export default function PaymentStatusPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.paymentId as string;
  const [payment, setPayment] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paymentId) return;

    const fetchPaymentStatus = async () => {
      try {
        // Try to get payment from payment_transactions table
        const { data: transaction, error: transactionError } = await supabase
          .from('payment_transactions')
          .select('*')
          .eq('transaction_id', paymentId)
          .single();

        if (transactionError && transactionError.code !== 'PGRST116') {
          throw transactionError;
        }

        if (transaction) {
          setPayment({
            id: transaction.transaction_id,
            booking_id: transaction.booking_id || '',
            payment_gateway: transaction.payment_gateway,
            status: transaction.status as any,
            amount: parseFloat(transaction.amount.toString()),
            created_at: transaction.created_at,
            payment_response: transaction.gateway_response,
          });
          setLoading(false);
          return;
        }

        // Try to get from bookings table
        const { data: booking, error: bookingError } = await supabase
          .from('bookings')
          .select('payment_id, payment_status, payment_gateway, payment_timestamp, payment_response, total_amount, id')
          .eq('payment_id', paymentId)
          .single();

        if (bookingError && bookingError.code !== 'PGRST116') {
          throw bookingError;
        }

        if (booking) {
          setPayment({
            id: booking.payment_id,
            booking_id: booking.id,
            payment_gateway: booking.payment_gateway || 'unknown',
            status: (booking.payment_status as any) || 'pending',
            amount: parseFloat(booking.total_amount?.toString() || '0'),
            created_at: booking.payment_timestamp || new Date().toISOString(),
            payment_response: booking.payment_response,
          });
        } else {
          // Check if we have a pending booking from sessionStorage (PhonePe redirect)
          const pendingBookingId = sessionStorage.getItem('pending_booking_id');
          const pendingGateway = sessionStorage.getItem('pending_payment_gateway');
          
          if (pendingBookingId && pendingGateway === 'phonepe') {
            // Try to find booking by ID
            const { data: pendingBooking } = await supabase
              .from('bookings')
              .select('payment_id, payment_status, payment_gateway, payment_timestamp, payment_response, total_amount, id')
              .eq('id', pendingBookingId)
              .single();

            if (pendingBooking) {
              setPayment({
                id: pendingBooking.payment_id || paymentId,
                booking_id: pendingBooking.id,
                payment_gateway: pendingBooking.payment_gateway || 'phonepe',
                status: (pendingBooking.payment_status as any) || 'pending',
                amount: parseFloat(pendingBooking.total_amount?.toString() || '0'),
                created_at: pendingBooking.payment_timestamp || new Date().toISOString(),
                payment_response: pendingBooking.payment_response,
              });
              // Clear session storage
              sessionStorage.removeItem('pending_booking_id');
              sessionStorage.removeItem('pending_payment_gateway');
            } else {
              setError('Payment not found. Please check your bookings.');
            }
          } else {
            setError('Payment not found');
          }
        }
      } catch (err: any) {
        console.error('Error fetching payment status:', err);
        setError(err.message || 'Failed to fetch payment status');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();

    // Poll for status updates if payment is pending or processing
    let pollCount = 0;
    const maxPolls = 12; // Poll for 1 minute (12 * 5 seconds)
    
    const interval = setInterval(() => {
      pollCount++;
      if (pollCount >= maxPolls) {
        clearInterval(interval);
        return;
      }
      
      fetchPaymentStatus();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [paymentId]);

  const getStatusIcon = () => {
    if (!payment) return null;

    switch (payment.status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-16 h-16 text-red-600" />;
      case 'refunded':
        return <CheckCircle className="w-16 h-16 text-orange-600" />;
      default:
        return <Clock className="w-16 h-16 text-yellow-600" />;
    }
  };

  const getStatusMessage = () => {
    if (!payment) return '';

    switch (payment.status) {
      case 'success':
        return 'Payment Successful!';
      case 'failed':
        return 'Payment Failed';
      case 'cancelled':
        return 'Payment Cancelled';
      case 'refunded':
        return 'Payment Refunded';
      case 'processing':
        return 'Payment Processing...';
      default:
        return 'Payment Pending';
    }
  };

  const getStatusDescription = () => {
    if (!payment) return '';

    switch (payment.status) {
      case 'success':
        return 'Your payment has been successfully processed. Your booking is confirmed.';
      case 'failed':
        return 'Your payment could not be processed. Please try again or contact support.';
      case 'cancelled':
        return 'Your payment was cancelled. You can try again or choose a different payment method.';
      case 'refunded':
        return 'Your payment has been refunded. The amount will be credited to your account within 5-7 business days.';
      case 'processing':
        return 'Your payment is being processed. Please wait...';
      default:
        return 'Your payment is pending. Please complete the payment or try again.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading payment status...</p>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The payment you are looking for does not exist.'}</p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => router.push('/')}>Go Home</Button>
            <Button variant="outline" onClick={() => router.push('/bookings')}>
              View Bookings
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="mb-6">{getStatusIcon()}</div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getStatusMessage()}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {getStatusDescription()}
        </p>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Payment ID:</span>
            <span className="font-mono text-sm">{payment.id}</span>
          </div>
          {payment.booking_id && (
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-mono text-sm">{payment.booking_id}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-semibold">₹{payment.amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Gateway:</span>
            <span className="capitalize">{payment.payment_gateway}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className={`capitalize font-semibold ${
              payment.status === 'success' ? 'text-green-600' :
              payment.status === 'failed' ? 'text-red-600' :
              payment.status === 'refunded' ? 'text-orange-600' :
              'text-yellow-600'
            }`}>
              {payment.status}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="text-sm">
              {new Date(payment.created_at).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {payment.status === 'success' && payment.booking_id && (
            <Link href={`/booking-confirmation/${payment.booking_id}`}>
              <Button className="w-full">View Booking Details</Button>
            </Link>
          )}
          
          {payment.status === 'failed' && (
            <Button
              onClick={() => router.push('/checkout')}
              className="w-full"
            >
              Try Again
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => router.push('/')}
            className="w-full"
          >
            Go Home
          </Button>

          {payment.booking_id && (
            <Link href={`/bookings/${payment.booking_id}`}>
              <Button variant="ghost" className="w-full">
                View All Bookings
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

