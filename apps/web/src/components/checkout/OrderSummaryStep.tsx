'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useBookingStore } from '@/store/bookingStore';
import { createBooking } from '@/lib/supabase-functions';
import { createRazorpayOrder, initiateRazorpayCheckout, verifyRazorpayPayment } from '@/lib/payments/razorpay';
import { initiatePhonePePayment } from '@/lib/payments/phonepe';
import { supabase } from '@/lib/supabase/client';
import { Check, MapPin, Calendar, Clock, User, CreditCard } from 'lucide-react';

interface Props {
  onNext: () => void;
}

export function OrderSummaryStep({ onNext }: Props) {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { currentBooking, setPaymentMethod, confirmBooking, resetCurrentBooking } =
    useBookingStore();
  const [paymentMethod, setPaymentMethodState] = useState<
    'prepaid' | 'pay_at_lab' | 'razorpay' | 'phonepe'
  >('pay_at_lab');
  const [paymentGateway, setPaymentGateway] = useState<'razorpay' | 'phonepe' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [availableGateways, setAvailableGateways] = useState<{ razorpay: boolean; phonepe: boolean }>({ razorpay: false, phonepe: false });

  // Check available payment gateways
  useEffect(() => {
    checkAvailableGateways();
  }, []);

  const checkAvailableGateways = async () => {
    try {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['razorpay_config', 'phonepe_config']);

      const gateways = { razorpay: false, phonepe: false };
      data?.forEach((setting) => {
        if (setting.key === 'razorpay_config' && setting.value?.enabled) {
          gateways.razorpay = true;
        }
        if (setting.key === 'phonepe_config' && setting.value?.enabled) {
          gateways.phonepe = true;
        }
      });
      setAvailableGateways(gateways);
    } catch (error) {
      console.error('Error checking payment gateways:', error);
    }
  };

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    setError('');
    
    // If prepaid payment selected, process payment first
    if (paymentMethod === 'prepaid' && paymentGateway) {
      try {
        await processPrepaidPayment();
        return;
      } catch (err: any) {
        setError(err.message || 'Payment failed. Please try again.');
        setIsProcessing(false);
        return;
      }
    }

    // For pay_at_lab, create booking directly
    await createBookingRecord();
  };

  const processPrepaidPayment = async () => {
    if (!currentBooking.patient) {
      throw new Error('Patient details are required');
    }

    const totalAmount = getTotalPrice();
    const userDetails = {
      name: currentBooking.patient.fullName,
      email: currentBooking.patient.email || '',
      phone: currentBooking.patient.phone,
    };

    // Create booking first with pending payment status
    let result;
    try {
      result = await createBooking(
        currentBooking.patient!,
        currentBooking.collection!,
        items,
        totalAmount,
        'prepaid'
      );
    } catch (err: any) {
      throw new Error(`Failed to create booking: ${err.message || 'Please try again'}`);
    }

    // Process payment based on gateway
    if (paymentGateway === 'razorpay') {
      try {
        // Create Razorpay order
        const order = await createRazorpayOrder(totalAmount, result.bookingId, userDetails);
        
        // Initialize checkout
        const paymentResponse = await initiateRazorpayCheckout(order, userDetails, result.bookingId);
        
        // Verify payment signature
        const verified = await verifyRazorpayPayment(paymentResponse, order.id);
        
        if (verified) {
          // Payment successful - booking already created
          clearCart();
          resetCurrentBooking();
          router.push(`/booking-confirmation/${result.bookingId}`);
        } else {
          // Payment verification failed - booking exists with pending status
          throw new Error('Payment verification failed. Your booking is pending. Please contact support.');
        }
      } catch (err: any) {
        // If payment fails, booking is already created with pending status
        // Redirect to payment status page or show error
        if (err.message.includes('cancelled')) {
          // User cancelled - redirect to booking with option to retry
          router.push(`/booking-confirmation/${result.bookingId}?payment=cancelled`);
        } else {
          // Payment failed - show error but booking exists
          throw new Error(`Payment failed: ${err.message || 'Please try again or contact support'}`);
        }
      }
    } else if (paymentGateway === 'phonepe') {
      try {
        const paymentUrl = await initiatePhonePePayment(totalAmount, result.bookingId, {
          name: userDetails.name,
          phone: userDetails.phone,
        });
        
        // Store booking ID in sessionStorage for redirect handling
        sessionStorage.setItem('pending_booking_id', result.bookingId);
        sessionStorage.setItem('pending_payment_gateway', 'phonepe');
        
        // PhonePe will redirect to callback URL
        // The webhook will handle the payment confirmation
        window.location.href = paymentUrl;
      } catch (err: any) {
        // If payment initiation fails, booking exists with pending status
        throw new Error(`Failed to initiate payment: ${err.message || 'Please try again or contact support'}`);
      }
    } else {
      throw new Error('Invalid payment gateway selected');
    }
  };

  const createBookingRecord = async () => {
    try {
      // Try to create booking in Supabase
      const result = await createBooking(
        currentBooking.patient!,
        currentBooking.collection!,
        items,
        getTotalPrice(),
        paymentMethod === 'prepaid' ? 'prepaid' : 'pay_at_lab'
      );

      // If successful, clear cart and redirect
      clearCart();
      resetCurrentBooking();
      router.push(`/booking-confirmation/${result.bookingId}`);
    } catch (err: any) {
      console.error('Supabase booking error, falling back to localStorage:', err);
      // Fallback to localStorage if Supabase fails
      const bookingId = confirmBooking();
      clearCart();
      resetCurrentBooking();
      router.push(`/booking-confirmation/${bookingId}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const patient = currentBooking.patient;
  const collection = currentBooking.collection;

  return (
    <div className="space-y-6">
      {/* Order Items */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.diagnosticCenterId}`}
              className="flex justify-between items-start pb-3 border-b border-gray-100 last:border-0"
            >
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  {item.diagnosticCenterName}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Report: {item.reportDeliveryTime}
                </p>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  ₹{item.price} × {item.quantity}
                </div>
                <div className="text-sm font-bold text-gray-900">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between text-lg font-bold">
            <span>Total Amount</span>
            <span className="text-primary-600">₹{getTotalPrice()}</span>
          </div>
        </div>
      </div>

      {/* Patient Details */}
      {patient && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900">Patient Details</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold">{patient.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Age / Gender:</span>
              <span className="font-semibold">
                {patient.age} years / {patient.gender}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold">{patient.phone}</span>
            </div>
            {patient.email && (
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{patient.email}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collection Details */}
      {collection && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-gray-900">Collection Details</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-20 text-gray-600">Type:</div>
              <div className="font-semibold">
                {collection.type === 'home' ? 'Home Collection' : 'Lab Visit'}
              </div>
            </div>
            {collection.type === 'home' && collection.address && (
              <div className="flex items-start gap-2">
                <div className="w-20 text-gray-600">Address:</div>
                <div className="flex-1">
                  <div className="font-semibold">{collection.address}</div>
                  <div className="text-gray-600">
                    {collection.city}, {collection.pincode}
                  </div>
                  {collection.landmark && (
                    <div className="text-gray-500">
                      Landmark: {collection.landmark}
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">
                {new Date(collection.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold capitalize">
                {collection.timeSlot}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-primary-600" />
          <h3 className="font-bold text-gray-900">Payment Method</h3>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
            <input
              type="radio"
              name="payment"
              value="pay_at_lab"
              checked={paymentMethod === 'pay_at_lab'}
              onChange={() => {
                setPaymentMethodState('pay_at_lab');
                setPaymentGateway(null);
              }}
              className="w-5 h-5 text-primary-600"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">
                Pay at {collection?.type === 'home' ? 'Home' : 'Lab'}
              </div>
              <div className="text-sm text-gray-600">
                Pay cash when sample is collected
              </div>
            </div>
          </label>

          {(availableGateways.razorpay || availableGateways.phonepe) && (
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                <input
                  type="radio"
                  name="payment"
                  value="prepaid"
                  checked={paymentMethod === 'prepaid'}
                  onChange={() => setPaymentMethodState('prepaid')}
                  className="w-5 h-5 text-primary-600"
                />
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">Pay Online</div>
                  <div className="text-sm text-gray-600">
                    Secure online payment
                  </div>
                </div>
              </label>

              {paymentMethod === 'prepaid' && (
                <div className="ml-8 space-y-2">
                  {availableGateways.razorpay && (
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="gateway"
                        value="razorpay"
                        checked={paymentGateway === 'razorpay'}
                        onChange={() => setPaymentGateway('razorpay')}
                        className="w-4 h-4 text-primary-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">Razorpay</div>
                        <div className="text-xs text-gray-600">Cards, UPI, Netbanking, Wallets</div>
                      </div>
                    </label>
                  )}
                  {availableGateways.phonepe && (
                    <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <input
                        type="radio"
                        name="gateway"
                        value="phonepe"
                        checked={paymentGateway === 'phonepe'}
                        onChange={() => setPaymentGateway('phonepe')}
                        className="w-4 h-4 text-primary-600"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">PhonePe</div>
                        <div className="text-xs text-gray-600">UPI, Cards, Wallets</div>
                      </div>
                    </label>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Button */}
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        <div className="flex justify-end">
          <button
            onClick={handleConfirmBooking}
            disabled={isProcessing || (paymentMethod === 'prepaid' && !paymentGateway)}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {paymentMethod === 'prepaid' ? 'Processing Payment...' : 'Processing...'}
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                {paymentMethod === 'prepaid' 
                  ? `Pay ₹${getTotalPrice()} & Confirm` 
                  : `Confirm Booking - ₹${getTotalPrice()}`
                }
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
