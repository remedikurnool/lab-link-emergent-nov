import { supabase } from './supabase/client';

// Fetch payment gateway settings from Supabase
export async function getPaymentSettings() {
  try {
    const { data } = await supabase
      .from('settings')
      .select('*')
      .in('key', ['razorpay_config', 'phonepe_config']);

    const settings: any = {};
    data?.forEach((item) => {
      settings[item.key] = item.value;
    });

    return settings;
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return null;
  }
}

// Razorpay integration
export async function initiateRazorpayPayment(
  amount: number,
  bookingId: string,
  userDetails: { name: string; email: string; phone: string }
) {
  try {
    const settings = await getPaymentSettings();
    const razorpayConfig = settings?.razorpay_config;

    if (!razorpayConfig?.enabled) {
      throw new Error('Razorpay is not enabled');
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    document.body.appendChild(script);

    return new Promise((resolve, reject) => {
      script.onload = () => {
        const options = {
          key: razorpayConfig.key_id,
          amount: amount * 100, // Convert to paise
          currency: 'INR',
          name: 'Lab Link',
          description: `Booking: ${bookingId}`,
          order_id: '', // Will be generated from backend
          prefill: {
            name: userDetails.name,
            email: userDetails.email,
            contact: userDetails.phone,
          },
          theme: {
            color: '#8B5CF6',
          },
          handler: function (response: any) {
            resolve(response);
          },
          modal: {
            ondismiss: function () {
              reject(new Error('Payment cancelled'));
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
    });
  } catch (error) {
    console.error('Razorpay payment error:', error);
    throw error;
  }
}

// PhonePe integration
export async function initiatePhonePePayment(
  amount: number,
  bookingId: string,
  userDetails: { name: string; phone: string }
) {
  try {
    const settings = await getPaymentSettings();
    const phonepeConfig = settings?.phonepe_config;

    if (!phonepeConfig?.enabled) {
      throw new Error('PhonePe is not enabled');
    }

    // PhonePe requires backend API call to generate payment link
    // This would typically call a Supabase Edge Function
    const response = await fetch('/api/phonepe/initiate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        bookingId,
        userDetails,
        merchantId: phonepeConfig.merchant_id,
      }),
    });

    const data = await response.json();
    
    if (data.paymentUrl) {
      // Redirect to PhonePe payment page
      window.location.href = data.paymentUrl;
    }

    return data;
  } catch (error) {
    console.error('PhonePe payment error:', error);
    throw error;
  }
}

// WhatsApp notification
export async function sendWhatsAppNotification(
  phone: string,
  templateId: string,
  params: Record<string, string>
) {
  try {
    const settings = await getPaymentSettings();
    const { data } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'whatsapp_config')
      .single();

    const whatsappConfig = data?.value;

    if (!whatsappConfig?.enabled) {
      console.log('WhatsApp is not enabled');
      return null;
    }

    // Call WhatsApp Business API via Edge Function
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        templateId,
        params,
        apiKey: whatsappConfig.api_key,
      }),
    });

    return await response.json();
  } catch (error) {
    console.error('WhatsApp notification error:', error);
    return null;
  }
}
