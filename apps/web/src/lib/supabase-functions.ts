import { supabase } from './supabase/client';
import type { CartItem } from '@/store/cartStore';
import type { PatientDetails, CollectionDetails } from '@/store/bookingStore';

// Create a new booking in Supabase
export async function createBooking(
  patient: PatientDetails,
  collection: CollectionDetails,
  items: CartItem[],
  totalAmount: number,
  paymentMethod: 'prepaid' | 'pay_at_lab'
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data: partner, error: partnerError } = await supabase
      .from('partners')
      .select('id, commission_percentage')
      .eq('user_id', user.id)
      .single();

    if (partnerError || !partner) {
      throw new Error('Partner profile not found');
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

    if (patientError) throw patientError;

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

    if (bookingError) throw bookingError;

    await supabase.from('commissions').insert({
      partner_id: partner.id,
      booking_id: bookingId,
      amount: partnerCommission,
      status: 'pending',
    });

    return { bookingId, booking };
  } catch (error: any) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

export async function updatePartnerProfile(profileData: any) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('partners')
      .update(profileData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    console.error('Error updating profile:', error);
    throw error;
  }
}
