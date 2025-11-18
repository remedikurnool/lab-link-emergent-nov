/**
 * Legacy integrations file - kept for backward compatibility
 * New implementations should use:
 * - @/lib/payments/razorpay.ts for Razorpay
 * - @/lib/payments/phonepe.ts for PhonePe
 * - @/lib/notifications/whatsapp.ts for WhatsApp
 * - @/lib/notifications/sms.ts for SMS
 * - @/lib/notifications/email.ts for Email
 */

import { createRazorpayOrder, initiateRazorpayCheckout } from './payments/razorpay';
import { initiatePhonePePayment } from './payments/phonepe';
import { sendWhatsAppNotification as sendWhatsApp } from './notifications/whatsapp';
import { sendSMSNotification as sendSMS } from './notifications/sms';
import { sendEmailNotification as sendEmail } from './notifications/email';

// Re-export for backward compatibility
export { sendWhatsApp as sendWhatsAppNotification };
export { sendSMS as sendSMSNotification };
export { sendEmail as sendEmailNotification };

// Legacy Razorpay function - use createRazorpayOrder + initiateRazorpayCheckout instead
export async function initiateRazorpayPayment(
  amount: number,
  bookingId: string,
  userDetails: { name: string; email: string; phone: string }
) {
  const order = await createRazorpayOrder(amount, bookingId, userDetails);
  return await initiateRazorpayCheckout(order, userDetails, bookingId);
}

// Legacy PhonePe function - use initiatePhonePePayment from phonepe.ts instead
export { initiatePhonePePayment };
