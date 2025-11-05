'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cartStore';
import { useBookingStore } from '@/store/bookingStore';
import { createBooking } from '@/lib/supabase-functions';
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
    'prepaid' | 'pay_at_lab'
  >('pay_at_lab');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleConfirmBooking = async () => {
    setIsProcessing(true);
    setError('');
    setPaymentMethod(paymentMethod);

    try {
      // Try to create booking in Supabase
      const result = await createBooking(
        currentBooking.patient!,
        currentBooking.collection!,
        items,
        getTotalPrice(),
        paymentMethod
      );

      // If successful, clear cart and redirect
      clearCart();
      resetCurrentBooking();
      router.push(`/booking-confirmation/${result.bookingId}`);
    } catch (err: any) {
      console.error('Supabase booking error, falling back to localStorage:', err);
      // Fallback to localStorage if Supabase fails
      const bookingData = {
        ...currentBooking,
        items,
        totalAmount: getTotalPrice(),
        paymentMethod,
      };
      
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
              onChange={() => setPaymentMethodState('pay_at_lab')}
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

          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-primary-500 transition-colors opacity-50">
            <input
              type="radio"
              name="payment"
              value="prepaid"
              disabled
              className="w-5 h-5 text-primary-600"
            />
            <div className="flex-1">
              <div className="font-semibold text-gray-900">
                Pay Online (Coming Soon)
              </div>
              <div className="text-sm text-gray-600">
                Razorpay / PhonePe / UPI
              </div>
            </div>
          </label>
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
            disabled={isProcessing}
            className="px-8 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold rounded-lg transition-colors flex items-center gap-2 shadow-lg"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Confirm Booking - ₹{getTotalPrice()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
