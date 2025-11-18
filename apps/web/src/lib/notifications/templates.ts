/**
 * Notification Templates
 * Centralized template definitions for WhatsApp, SMS, and Email notifications
 */

export interface TemplateParams {
  [key: string]: string | number;
}

/**
 * WhatsApp Message Templates
 */
export const whatsappTemplates = {
  booking_confirmation: (params: TemplateParams) => ({
    templateName: 'booking_confirmation',
    params: {
      booking_id: String(params.bookingId || ''),
      patient_name: String(params.patientName || ''),
      amount: String(params.amount || ''),
      date: String(params.date || ''),
      time_slot: String(params.timeSlot || ''),
      collection_type: String(params.collectionType || 'home'),
    },
    message: `✅ Booking Confirmed!

Booking ID: ${params.bookingId}
Patient: ${params.patientName}
Amount: ${params.amount}
Date: ${params.date}
Time: ${params.timeSlot}
Collection: ${params.collectionType === 'home' ? 'Home Collection' : 'Lab Visit'}

Thank you for choosing Lab Link!`,
  }),

  booking_status_update: (params: TemplateParams) => ({
    templateName: 'booking_status_update',
    params: {
      booking_id: String(params.bookingId || ''),
      old_status: String(params.oldStatus || ''),
      new_status: String(params.newStatus || ''),
    },
    message: `📋 Booking Status Updated

Booking ID: ${params.bookingId}
Status: ${params.oldStatus} → ${params.newStatus}

Check your booking details for more information.`,
  }),

  commission_earned: (params: TemplateParams) => ({
    templateName: 'commission_earned',
    params: {
      commission_amount: String(params.amount || ''),
      booking_id: String(params.bookingId || ''),
      total_amount: String(params.totalAmount || ''),
    },
    message: `💰 Commission Earned!

You've earned a commission of ${params.amount} for booking ${params.bookingId}.

Total booking amount: ${params.totalAmount}
Commission will be processed soon.

Thank you for your partnership!`,
  }),

  commission_paid: (params: TemplateParams) => ({
    templateName: 'commission_paid',
    params: {
      commission_amount: String(params.amount || ''),
      booking_id: String(params.bookingId || ''),
    },
    message: `✅ Commission Paid!

Commission of ${params.amount} for booking ${params.bookingId} has been credited to your account.

Check your earnings dashboard for details.`,
  }),

  payment_success: (params: TemplateParams) => ({
    templateName: 'payment_success',
    params: {
      booking_id: String(params.bookingId || ''),
      amount: String(params.amount || ''),
      payment_id: String(params.paymentId || ''),
    },
    message: `💳 Payment Successful!

Booking ID: ${params.bookingId}
Amount: ${params.amount}
Payment ID: ${params.paymentId}

Your booking is confirmed. Thank you!`,
  }),

  payment_failed: (params: TemplateParams) => ({
    templateName: 'payment_failed',
    params: {
      booking_id: String(params.bookingId || ''),
      amount: String(params.amount || ''),
      reason: String(params.reason || 'Payment processing failed'),
    },
    message: `❌ Payment Failed

Booking ID: ${params.bookingId}
Amount: ${params.amount}
Reason: ${params.reason}

Please try again or contact support.`,
  }),

  report_ready: (params: TemplateParams) => ({
    templateName: 'report_ready',
    params: {
      booking_id: String(params.bookingId || ''),
      patient_name: String(params.patientName || ''),
      report_url: String(params.reportUrl || ''),
    },
    message: `📄 Report Ready!

Your test report for booking ${params.bookingId} is now available.

Patient: ${params.patientName}
View report: ${params.reportUrl}

Thank you for using Lab Link!`,
  }),

  appointment_reminder: (params: TemplateParams) => ({
    templateName: 'appointment_reminder',
    params: {
      booking_id: String(params.bookingId || ''),
      patient_name: String(params.patientName || ''),
      date: String(params.date || ''),
      time_slot: String(params.timeSlot || ''),
    },
    message: `⏰ Appointment Reminder

Booking ID: ${params.bookingId}
Patient: ${params.patientName}
Date: ${params.date}
Time: ${params.timeSlot}

Please be ready for sample collection.`,
  }),
};

/**
 * SMS Message Templates
 */
export const smsTemplates = {
  booking_confirmation: (params: TemplateParams) =>
    `Booking confirmed! ID: ${params.bookingId}, Amount: ${params.amount}, Date: ${params.date}. Lab Link`,

  booking_status_update: (params: TemplateParams) =>
    `Booking ${params.bookingId} status updated to ${params.newStatus}. Lab Link`,

  commission_earned: (params: TemplateParams) =>
    `Commission earned: ${params.amount} for booking ${params.bookingId}. Lab Link`,

  commission_paid: (params: TemplateParams) =>
    `Commission of ${params.amount} paid for booking ${params.bookingId}. Lab Link`,

  payment_success: (params: TemplateParams) =>
    `Payment successful! Booking ${params.bookingId}, Amount: ${params.amount}. Lab Link`,

  payment_failed: (params: TemplateParams) =>
    `Payment failed for booking ${params.bookingId}. Please try again. Lab Link`,

  report_ready: (params: TemplateParams) =>
    `Report ready for booking ${params.bookingId}. View: ${params.reportUrl}. Lab Link`,

  appointment_reminder: (params: TemplateParams) =>
    `Reminder: Appointment on ${params.date} at ${params.timeSlot} for booking ${params.bookingId}. Lab Link`,
};

/**
 * Email Subject Templates
 */
export const emailSubjects = {
  booking_confirmation: (params: TemplateParams) =>
    `Booking Confirmation - ${params.bookingId}`,
  booking_status_update: (params: TemplateParams) =>
    `Booking Status Update - ${params.bookingId}`,
  commission_earned: (params: TemplateParams) =>
    `Commission Earned - ₹${params.amount}`,
  commission_paid: (params: TemplateParams) =>
    `Commission Paid - ₹${params.amount}`,
  payment_success: (params: TemplateParams) =>
    `Payment Successful - Booking ${params.bookingId}`,
  payment_failed: (params: TemplateParams) =>
    `Payment Failed - Booking ${params.bookingId}`,
  report_ready: (params: TemplateParams) =>
    `Test Report Ready - Booking ${params.bookingId}`,
  appointment_reminder: (params: TemplateParams) =>
    `Appointment Reminder - ${params.date}`,
};

/**
 * Get template by name
 */
export function getWhatsAppTemplate(
  templateName: keyof typeof whatsappTemplates,
  params: TemplateParams
) {
  const template = whatsappTemplates[templateName];
  if (!template) {
    throw new Error(`WhatsApp template ${templateName} not found`);
  }
  return template(params);
}

export function getSMSTemplate(
  templateName: keyof typeof smsTemplates,
  params: TemplateParams
): string {
  const template = smsTemplates[templateName];
  if (!template) {
    throw new Error(`SMS template ${templateName} not found`);
  }
  return template(params);
}

export function getEmailSubject(
  templateName: keyof typeof emailSubjects,
  params: TemplateParams
): string {
  const subject = emailSubjects[templateName];
  if (!subject) {
    throw new Error(`Email subject template ${templateName} not found`);
  }
  return subject(params);
}

