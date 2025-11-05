// Shared TypeScript types across the monorepo

export type PartnerType =
  | 'pharmacist'
  | 'nurse'
  | 'asha_worker'
  | 'technician'
  | 'medical_representative'
  | 'other';

export type ServiceCategory = 'test' | 'scan' | 'package';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'sample_collected'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'completed' | 'refunded';

export type PaymentMethod = 'razorpay' | 'phonepe' | 'cash';
