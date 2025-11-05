'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useBookingStore, PatientDetails } from '@/store/bookingStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const patientSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1).max(120, 'Invalid age'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(10, 'Phone number must be 10 digits').max(10),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  relationship: z.enum(['self', 'mother', 'father', 'spouse', 'child', 'other']),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface Props {
  onNext: () => void;
}

export function PatientDetailsStep({ onNext }: Props) {
  const { currentBooking, setPatientDetails } = useBookingStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: currentBooking.patient || {
      relationship: 'self',
      gender: 'male',
    },
  });

  const onSubmit = (data: PatientFormData) => {
    setPatientDetails(data as PatientDetails);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Patient Information
        </h2>

        <div className="space-y-4">
          {/* Relationship */}
          <div>
            <Label htmlFor="relationship">This test is for</Label>
            <select
              {...register('relationship')}
              className="w-full mt-1 px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="self">Myself</option>
              <option value="mother">My Mother</option>
              <option value="father">My Father</option>
              <option value="spouse">My Spouse</option>
              <option value="child">My Child</option>
              <option value="other">Other Family Member</option>
            </select>
          </div>

          {/* Full Name */}
          <div>
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              {...register('fullName')}
              placeholder="Enter patient's full name"
              className="mt-1"
            />
            {errors.fullName && (
              <p className="text-sm text-red-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Age and Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                {...register('age')}
                type="number"
                placeholder="Age"
                className="mt-1"
              />
              {errors.age && (
                <p className="text-sm text-red-500 mt-1">{errors.age.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <select
                {...register('gender')}
                className="w-full mt-1 px-4 py-2 h-10 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Phone */}
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              {...register('phone')}
              type="tel"
              placeholder="10 digit mobile number"
              maxLength={10}
              className="mt-1"
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              {...register('email')}
              type="email"
              placeholder="email@example.com"
              className="mt-1"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors"
        >
          Continue to Collection Details
        </button>
      </div>
    </form>
  );
}
