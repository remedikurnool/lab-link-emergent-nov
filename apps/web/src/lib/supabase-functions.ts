import { supabase } from './supabase/client';
import type { CartItem } from '@/store/cartStore';
import type { PatientDetails, CollectionDetails } from '@/store/bookingStore';
import { sendWhatsAppNotification } from './notifications/whatsapp';
import { sendSMSNotification } from './notifications/sms';
import { sendEmailNotification } from './notifications/email';
import { handleError, withErrorHandling } from './errors/error-handler';
import { retry } from './utils/retry';

// Create a new booking in Supabase
export const createBooking = withErrorHandling(async function createBooking(
  patient: PatientDetails,
  collection: CollectionDetails,
  items: CartItem[],
  totalAmount: number,
  paymentMethod: 'prepaid' | 'pay_at_lab'
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Fetch partner with retry on transient failures
  const partnerResult = await retry(
    async () => {
      const result = await supabase
        .from('partners')
        .select('id, commission_percentage, notification_preferences')
        .eq('user_id', user.id)
        .single();
      if (result.error) throw result.error;
      return result;
    },
    { retryable: (err) => err?.code === 'NETWORK_ERROR' || err?.statusCode >= 500 }
  );
  const { data: partner, error: partnerError } = partnerResult;

  if (partnerError || !partner) {
    throw handleError(partnerError || new Error('Partner profile not found'), {
      showToast: true,
      logError: true,
    });
  }

  const { data: patientRecord, error: patientError } = await supabase
    .from('patients')
    .insert({
      partner_id: partner.id,
      full_name: patient.fullName,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email || null,
      relationship: patient.relationship,
    })
    .select()
    .single();

  if (patientError) {
    throw handleError(patientError, { showToast: true });
  }

  const bookingId = `BK${Date.now()}`;
  const partnerCommission = (totalAmount * partner.commission_percentage) / 100;

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      id: bookingId,
      partner_id: partner.id,
      patient_id: patientRecord.id,
      items: items,
      total_amount: totalAmount,
      partner_commission: partnerCommission,
      collection_type: collection.type,
      collection_date: collection.date,
      time_slot: collection.timeSlot,
      collection_address: collection.address || null,
      collection_city: collection.city || null,
      collection_pincode: collection.pincode || null,
      collection_landmark: collection.landmark || null,
      payment_method: paymentMethod,
      status: 'pending',
    })
    .select()
    .single();

  if (bookingError) {
    throw handleError(bookingError, { showToast: true });
  }

  const { data: commission } = await supabase.from('commissions').insert({
    partner_id: partner.id,
    booking_id: bookingId,
    amount: partnerCommission,
    status: 'pending',
  }).select().single();

  // Send notifications after booking creation (non-blocking)
  sendBookingNotifications(booking, patient, partner, totalAmount, bookingId).catch(err => {
    console.error('Failed to send notifications:', err);
    // Don't throw - notifications are non-critical
  });

  return { bookingId, booking };
}, { showToast: true, logError: true });

export const updatePartnerProfile = withErrorHandling(async function updatePartnerProfile(
  profileData: any
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('partners')
    .update(profileData)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    throw handleError(error, { showToast: true });
  }
  return data;
}, { showToast: true, logError: true });

/**
 * Send notifications after booking creation
 */
async function sendBookingNotifications(
  booking: any,
  patient: PatientDetails,
  partner: any,
  totalAmount: number,
  bookingId: string
) {
  try {
    // Get partner notification preferences
    const preferences = partner.notification_preferences || {
      whatsapp: true,
      sms: true,
      email: true,
      push: true,
    };

    // Prepare notification data
    const bookingData = {
      bookingId,
      amount: `₹${totalAmount}`,
      patientName: patient.fullName,
      date: new Date(booking.collection_date).toLocaleDateString('en-IN'),
      timeSlot: booking.time_slot,
    };

    // Send WhatsApp notification
    if (preferences.whatsapp) {
      sendWhatsAppNotification(
        patient.phone,
        'booking_confirmation',
        bookingData
      ).catch(err => console.error('WhatsApp notification failed:', err));
    }

    // Send SMS notification
    if (preferences.sms) {
      sendSMSNotification(
        patient.phone,
        `Your booking ${bookingId} is confirmed. Amount: ₹${totalAmount}. Date: ${bookingData.date}, Time: ${booking.time_slot}`
      ).catch(err => console.error('SMS notification failed:', err));
    }

    // Send Email notification
    if (preferences.email && patient.email) {
      sendEmailNotification({
        to: patient.email,
        subject: `Booking Confirmation - ${bookingId}`,
        html: `
          <h2>Booking Confirmed!</h2>
          <p>Dear ${patient.fullName},</p>
          <p>Your booking has been confirmed successfully.</p>
          <ul>
            <li><strong>Booking ID:</strong> ${bookingId}</li>
            <li><strong>Amount:</strong> ₹${totalAmount}</li>
            <li><strong>Date:</strong> ${bookingData.date}</li>
            <li><strong>Time:</strong> ${booking.time_slot}</li>
          </ul>
          <p>Thank you for choosing Lab Link!</p>
        `,
        text: `Booking Confirmed! Booking ID: ${bookingId}, Amount: ₹${totalAmount}, Date: ${bookingData.date}, Time: ${booking.time_slot}`,
      }).catch(err => console.error('Email notification failed:', err));
    }
  } catch (error) {
    console.error('Error sending notifications:', error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Send commission notification
 */
export async function sendCommissionNotification(
  partnerId: string,
  commissionAmount: number,
  bookingId: string
) {
  try {
    // Get partner details
    const { data: partner } = await supabase
      .from('partners')
      .select('phone, email, notification_preferences')
      .eq('id', partnerId)
      .single();

    if (!partner) return;

    const preferences = partner.notification_preferences || {
      whatsapp: true,
      sms: true,
      email: true,
    };

    const commissionData = {
      amount: `₹${commissionAmount}`,
      bookingId,
    };

    // Send WhatsApp
    if (preferences.whatsapp && partner.phone) {
      sendWhatsAppNotification(
        partner.phone,
        'commission_earned',
        commissionData
      ).catch(err => console.error('WhatsApp notification failed:', err));
    }

    // Send SMS
    if (preferences.sms && partner.phone) {
      sendSMSNotification(
        partner.phone,
        `Congratulations! You earned ₹${commissionAmount} commission for booking ${bookingId}`
      ).catch(err => console.error('SMS notification failed:', err));
    }

    // Send Email
    if (preferences.email && partner.email) {
      sendEmailNotification({
        to: partner.email,
        subject: `Commission Earned - ₹${commissionAmount}`,
        html: `
          <h2>Commission Earned!</h2>
          <p>Congratulations! You have earned a commission.</p>
          <ul>
            <li><strong>Amount:</strong> ₹${commissionAmount}</li>
            <li><strong>Booking ID:</strong> ${bookingId}</li>
          </ul>
          <p>Thank you for your partnership with Lab Link!</p>
        `,
        text: `Commission Earned: ₹${commissionAmount} for booking ${bookingId}`,
      }).catch(err => console.error('Email notification failed:', err));
    }
  } catch (error) {
    console.error('Error sending commission notification:', error);
  }
}

/**
 * Send booking status update notification
 */
export async function sendBookingStatusNotification(
  bookingId: string,
  status: string,
  patientPhone?: string,
  patientEmail?: string
) {
  try {
    if (!patientPhone && !patientEmail) {
      // Get patient details from booking
      const { data: booking } = await supabase
        .from('bookings')
        .select('patient_id, patients(phone, email)')
        .eq('id', bookingId)
        .single();

      if (booking?.patients) {
        patientPhone = (booking.patients as any).phone;
        patientEmail = (booking.patients as any).email;
      }
    }

    const statusData = {
      bookingId,
      status: status.charAt(0).toUpperCase() + status.slice(1),
    };

    // Send WhatsApp
    if (patientPhone) {
      sendWhatsAppNotification(
        patientPhone,
        'booking_status_update',
        statusData
      ).catch(err => console.error('WhatsApp notification failed:', err));
    }

    // Send SMS
    if (patientPhone) {
      sendSMSNotification(
        patientPhone,
        `Your booking ${bookingId} status has been updated to ${statusData.status}`
      ).catch(err => console.error('SMS notification failed:', err));
    }

    // Send Email
    if (patientEmail) {
      sendEmailNotification({
        to: patientEmail,
        subject: `Booking Status Update - ${bookingId}`,
        html: `
          <h2>Booking Status Updated</h2>
          <p>Your booking status has been updated.</p>
          <ul>
            <li><strong>Booking ID:</strong> ${bookingId}</li>
            <li><strong>Status:</strong> ${statusData.status}</li>
          </ul>
        `,
        text: `Booking ${bookingId} status updated to ${statusData.status}`,
      }).catch(err => console.error('Email notification failed:', err));
    }
  } catch (error) {
    console.error('Error sending status notification:', error);
  }
}
