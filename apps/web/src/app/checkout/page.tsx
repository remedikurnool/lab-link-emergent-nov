'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { useCartStore } from '@/store/cartStore';
import { useBookingStore } from '@/store/bookingStore';
import { PatientDetailsStep } from '@/components/checkout/PatientDetailsStep';
import { CollectionDetailsStep } from '@/components/checkout/CollectionDetailsStep';
import { OrderSummaryStep } from '@/components/checkout/OrderSummaryStep';
import { ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { currentStep, setStep, currentBooking, resetCurrentBooking } = useBookingStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopBar />
        <main className="pb-20 md:pb-8">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                No items in cart
              </h1>
              <p className="text-gray-600 mb-6">
                Please add items to your cart before checkout
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

  const steps = [
    { number: 1, title: 'Patient Details', component: PatientDetailsStep },
    { number: 2, title: 'Collection Details', component: CollectionDetailsStep },
    { number: 3, title: 'Review & Payment', component: OrderSummaryStep },
  ];

  const CurrentStepComponent = steps[currentStep - 1].component;

  const handleNext = () => {
    if (currentStep < steps.length) {
      setStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setStep(currentStep - 1);
    } else {
      router.push('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />

      <main className="pb-20 md:pb-8">
        <div className="container mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
              <p className="text-sm text-gray-600">
                Complete your booking in {steps.length} easy steps
              </p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                        currentStep > step.number
                          ? 'bg-green-500 text-white'
                          : currentStep === step.number
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {currentStep > step.number ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium hidden sm:block ${
                        currentStep >= step.number
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-1 flex-1 mx-2 rounded ${
                        currentStep > step.number
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-3xl mx-auto">
            <CurrentStepComponent onNext={handleNext} />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
