import { supabase } from '../supabase/client';

export interface PhonePePaymentResponse {
  success: boolean;
  code: string;
  message: string;
  data: {
    merchantId: string;
    merchantTransactionId: string;
    instrumentResponse: {
      type: string;
      redirectInfo: {
        url: string;
        method: string;
      };
    };
  };
}

/**
 * Initiate PhonePe payment
 */
export async function initiatePhonePePayment(
  amount: number,
  bookingId: string,
  userDetails: { name: string; phone: string }
): Promise<string> {
  try {
    const { data, error } = await supabase.functions.invoke('phonepe-initiate', {
      body: {
        amount: amount * 100, // Convert to paise
        merchantTransactionId: `LABLINK_${bookingId}_${Date.now()}`,
        merchantUserId: userDetails.phone,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment-status`,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/booking-confirmation/${bookingId}`,
        redirectMode: 'REDIRECT',
        mobileNumber: userDetails.phone,
        paymentInstrument: {
          type: 'PAY_PAGE',
        },
      },
    });

    if (error) throw error;
    if (!data || !data.data?.instrumentResponse?.redirectInfo?.url) {
      throw new Error('Failed to create PhonePe payment link');
    }

    return data.data.instrumentResponse.redirectInfo.url;
  } catch (error: any) {
    console.error('Error initiating PhonePe payment:', error);
    throw new Error(error.message || 'Failed to initiate payment');
  }
}

/**
 * Verify PhonePe payment status
 */
export async function verifyPhonePePayment(
  merchantTransactionId: string
): Promise<{ success: boolean; status: string }> {
  try {
    const { data, error } = await supabase.functions.invoke('phonepe-status', {
      body: {
        merchantTransactionId,
      },
    });

    if (error) throw error;
    return {
      success: data?.success === true,
      status: data?.data?.state || 'PENDING',
    };
  } catch (error: any) {
    console.error('Error verifying PhonePe payment:', error);
    return { success: false, status: 'FAILED' };
  }
}

