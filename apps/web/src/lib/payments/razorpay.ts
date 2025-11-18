import { supabase } from '../supabase/client';

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPaymentResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

/**
 * Create Razorpay order via Edge Function
 */
export async function createRazorpayOrder(
  amount: number,
  bookingId: string,
  userDetails: { name: string; email: string; phone: string }
): Promise<RazorpayOrderResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('razorpay-create-order', {
      body: {
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: bookingId,
        notes: {
          booking_id: bookingId,
          customer_name: userDetails.name,
          customer_email: userDetails.email,
          customer_phone: userDetails.phone,
        },
      },
    });

    if (error) throw error;
    if (!data || !data.order) {
      throw new Error('Failed to create Razorpay order');
    }

    return data.order;
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    throw new Error(error.message || 'Failed to create payment order');
  }
}

/**
 * Verify Razorpay payment signature
 */
export async function verifyRazorpayPayment(
  paymentResponse: RazorpayPaymentResponse,
  orderId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.functions.invoke('razorpay-verify-payment', {
      body: {
        payment_id: paymentResponse.razorpay_payment_id,
        order_id: orderId,
        signature: paymentResponse.razorpay_signature,
      },
    });

    if (error) throw error;
    return data?.verified === true;
  } catch (error: any) {
    console.error('Error verifying Razorpay payment:', error);
    return false;
  }
}

/**
 * Get Razorpay key from settings
 */
async function getRazorpayKey(): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'razorpay_config')
      .single();

    if (error) throw error;
    
    const config = data?.value as { enabled: boolean; key_id: string; key_secret: string };
    
    if (!config?.enabled || !config.key_id) {
      throw new Error('Razorpay is not configured. Please contact admin.');
    }

    return config.key_id;
  } catch (error: any) {
    console.error('Error fetching Razorpay key:', error);
    throw new Error('Failed to load payment gateway configuration');
  }
}

/**
 * Initialize Razorpay checkout
 */
export async function initiateRazorpayCheckout(
  order: RazorpayOrderResponse,
  userDetails: { name: string; email: string; phone: string },
  bookingId: string
): Promise<RazorpayPaymentResponse> {
  return new Promise(async (resolve, reject) => {
    try {
      // Get Razorpay key from settings
      const razorpayKey = await getRazorpayKey();

      // Load Razorpay script if not already loaded
      if ((window as any).Razorpay) {
        openRazorpayCheckout(razorpayKey, order, userDetails, bookingId, resolve, reject);
      } else {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          openRazorpayCheckout(razorpayKey, order, userDetails, bookingId, resolve, reject);
        };
        script.onerror = () => {
          reject(new Error('Failed to load Razorpay checkout script. Please check your internet connection.'));
        };
        document.body.appendChild(script);
      }
    } catch (error: any) {
      reject(error);
    }
  });
}

function openRazorpayCheckout(
  razorpayKey: string,
  order: RazorpayOrderResponse,
  userDetails: { name: string; email: string; phone: string },
  bookingId: string,
  resolve: (value: RazorpayPaymentResponse) => void,
  reject: (error: Error) => void
) {
  const options = {
    key: razorpayKey,
    amount: order.amount,
    currency: order.currency,
    name: 'Lab Link',
    description: `Booking: ${bookingId}`,
    order_id: order.id,
    prefill: {
      name: userDetails.name,
      email: userDetails.email,
      contact: userDetails.phone,
    },
    theme: {
      color: '#8B5CF6',
    },
    handler: function (response: RazorpayPaymentResponse) {
      resolve(response);
    },
    modal: {
      ondismiss: function () {
        reject(new Error('Payment cancelled by user'));
      },
    },
    retry: {
      enabled: true,
      max_count: 3,
    },
    notes: {
      booking_id: bookingId,
    },
  };

  try {
    const rzp = new (window as any).Razorpay(options);
    rzp.on('payment.failed', function (response: any) {
      reject(new Error(response.error?.description || 'Payment failed. Please try again.'));
    });
    rzp.open();
  } catch (error: any) {
    reject(new Error('Failed to initialize payment gateway. Please try again.'));
  }
}

