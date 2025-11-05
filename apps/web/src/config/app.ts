export const appConfig = {
  // Partner Types
  partnerTypes: [
    'pharmacist',
    'nurse',
    'asha_worker',
    'technician',
    'medical_representative',
    'other',
  ] as const,

  // Service Categories
  serviceCategories: ['test', 'scan', 'package'] as const,

  // Booking Status
  bookingStatus: [
    'pending',
    'confirmed',
    'sample_collected',
    'in_progress',
    'completed',
    'cancelled',
  ] as const,

  // Commission Status
  commissionStatus: ['pending', 'approved', 'paid'] as const,

  // Payment Methods (to be configured by admin)
  paymentMethods: ['razorpay', 'phonepe', 'cash'] as const,
};

export type PartnerType = (typeof appConfig.partnerTypes)[number];
export type ServiceCategory = (typeof appConfig.serviceCategories)[number];
export type BookingStatus = (typeof appConfig.bookingStatus)[number];
export type CommissionStatus = (typeof appConfig.commissionStatus)[number];
export type PaymentMethod = (typeof appConfig.paymentMethods)[number];
