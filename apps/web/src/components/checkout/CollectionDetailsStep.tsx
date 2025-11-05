'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useState } from 'react';
import { useBookingStore, CollectionDetails } from '@/store/bookingStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home, Building2, Calendar, Clock } from 'lucide-react';

const collectionSchema = z.object({
  type: z.enum(['home', 'lab']),
  date: z.string().min(1, 'Please select a date'),
  timeSlot: z.enum(['morning', 'afternoon', 'evening']),
  address: z.string().optional(),
  city: z.string().optional(),
  pincode: z.string().optional(),
  landmark: z.string().optional(),
}).refine(
  (data) => {
    if (data.type === 'home') {
      return !!data.address && !!data.city && !!data.pincode;
    }
    return true;
  },
  {
    message: 'Address details are required for home collection',
    path: ['address'],
  }
);

type CollectionFormData = z.infer<typeof collectionSchema>;

interface Props {
  onNext: () => void;
}

export function CollectionDetailsStep({ onNext }: Props) {
  const { currentBooking, setCollectionDetails } = useBookingStore();
  const [collectionType, setCollectionType] = useState<'home' | 'lab'>(
    currentBooking.collection?.type || 'lab'
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: currentBooking.collection || {
      type: 'lab',
      timeSlot: 'morning',
    },
  });

  const onSubmit = (data: CollectionFormData) => {
    setCollectionDetails(data as CollectionDetails);
    onNext();
  };

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Collection Type */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Collection Method
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setCollectionType('home')}
            className={`p-6 rounded-xl border-2 transition-all ${
              collectionType === 'home'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              {...register('type')}
              value="home"
              checked={collectionType === 'home'}
              onChange={() => setCollectionType('home')}
              className="sr-only"
            />
            <Home
              className={`w-8 h-8 mb-3 ${
                collectionType === 'home' ? 'text-primary-600' : 'text-gray-400'
              }`}
            />
            <h3 className="font-bold text-gray-900 mb-1">Home Collection</h3>
            <p className="text-sm text-gray-600">
              Sample collected from your doorstep
            </p>
          </button>

          <button
            type="button"
            onClick={() => setCollectionType('lab')}
            className={`p-6 rounded-xl border-2 transition-all ${
              collectionType === 'lab'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              {...register('type')}
              value="lab"
              checked={collectionType === 'lab'}
              onChange={() => setCollectionType('lab')}
              className="sr-only"
            />
            <Building2
              className={`w-8 h-8 mb-3 ${
                collectionType === 'lab' ? 'text-primary-600' : 'text-gray-400'
              }`}
            />
            <h3 className="font-bold text-gray-900 mb-1">Lab Visit</h3>
            <p className="text-sm text-gray-600">
              Visit diagnostic centre for sample collection
            </p>
          </button>
        </div>
      </div>

      {/* Address Details - Only for Home Collection */}
      {collectionType === 'home' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Collection Address
          </h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Full Address *</Label>
              <textarea
                {...register('address')}
                rows={3}
                placeholder="House/Flat No., Street Name, Area"
                className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              {errors.address && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  {...register('city')}
                  placeholder="City"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  {...register('pincode')}
                  placeholder="6 digits"
                  maxLength={6}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="landmark">Landmark (Optional)</Label>
              <Input
                {...register('landmark')}
                placeholder="Nearby landmark for easy location"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Date and Time Selection */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Preferred Date & Time
        </h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Select Date *
            </Label>
            <Input
              type="date"
              {...register('date')}
              min={minDate}
              className="mt-1"
            />
            {errors.date && (
              <p className="text-sm text-red-500 mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <Label className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              Preferred Time Slot *
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'morning', label: 'Morning', time: '6 AM - 12 PM' },
                { value: 'afternoon', label: 'Afternoon', time: '12 PM - 5 PM' },
                { value: 'evening', label: 'Evening', time: '5 PM - 9 PM' },
              ].map((slot) => (
                <label
                  key={slot.value}
                  className="relative cursor-pointer"
                >
                  <input
                    type="radio"
                    {...register('timeSlot')}
                    value={slot.value}
                    className="sr-only peer"
                  />
                  <div className="p-4 rounded-lg border-2 border-gray-200 peer-checked:border-primary-500 peer-checked:bg-primary-50 hover:border-gray-300 transition-colors text-center">
                    <div className="font-semibold text-gray-900">
                      {slot.label}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {slot.time}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
        >
          Continue to Review
        </button>
      </div>
    </form>
  );
}
