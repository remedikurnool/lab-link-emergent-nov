import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import crypto from 'https://deno.land/std@0.168.0/node/crypto.ts';

const PHONEPE_SALT_KEY = Deno.env.get('PHONEPE_SALT_KEY') || '';
const PHONEPE_SALT_INDEX = Deno.env.get('PHONEPE_SALT_INDEX') || '1';

interface PhonePeWebhookPayload {
  response: string; // Base64 encoded response
}

interface PhonePeResponse {
  code: string;
  data: {
    merchantTransactionId: string;
    transactionId: string;
    amount: number;
    state: string;
    responseCode: string;
    paymentInstrument: {
      type: string;
    };
  };
}

function verifyPhonePeSignature(
  payload: string,
  xVerify: string,
  saltKey: string,
  saltIndex: string
): boolean {
  try {
    const base64Payload = btoa(payload);
    const stringToHash = base64Payload + '/pg/v1/status/' + saltKey;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const finalXHeader = sha256Hash + '###' + saltIndex;

    return finalXHeader === xVerify;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-verify',
      },
    });
  }

  try {
    const xVerify = req.headers.get('x-verify');
    const body = await req.text();

    if (!xVerify) {
      return new Response(
        JSON.stringify({ error: 'Missing x-verify header' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload: PhonePeWebhookPayload = JSON.parse(body);

    // Verify webhook signature
    if (!verifyPhonePeSignature(payload.response, xVerify, PHONEPE_SALT_KEY, PHONEPE_SALT_INDEX)) {
      console.error('Invalid PhonePe webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decode base64 response
    const decodedResponse = atob(payload.response);
    const response: PhonePeResponse = JSON.parse(decodedResponse);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle payment status
    if (response.code === 'PAYMENT_SUCCESS' || response.data.state === 'COMPLETED') {
      await handlePaymentSuccess(response, supabase);
    } else if (response.data.state === 'FAILED') {
      await handlePaymentFailed(response, supabase);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

async function handlePaymentSuccess(
  response: PhonePeResponse,
  supabase: any
) {
  const payment = response.data;

  // Find booking by merchantTransactionId
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, partner_id, total_amount')
    .eq('payment_id', payment.merchantTransactionId)
    .single();

  if (bookingError || !booking) {
    console.error('Booking not found for payment:', payment.merchantTransactionId);
    return;
  }

  // Update booking payment status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'success',
      payment_timestamp: new Date().toISOString(),
      payment_response: payment,
      status: 'confirmed',
    })
    .eq('id', booking.id);

  // Create or update payment transaction
  await supabase
    .from('payment_transactions')
    .upsert({
      transaction_id: payment.transactionId,
      booking_id: booking.id,
      partner_id: booking.partner_id,
      payment_gateway: 'phonepe',
      amount: payment.amount / 100, // PhonePe amounts are in paise
      currency: 'INR',
      status: 'success',
      gateway_response: payment,
    }, {
      onConflict: 'transaction_id',
    });

  console.log('PhonePe payment success processed:', payment.transactionId);
}

async function handlePaymentFailed(
  response: PhonePeResponse,
  supabase: any
) {
  const payment = response.data;

  // Find booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, partner_id')
    .eq('payment_id', payment.merchantTransactionId)
    .single();

  if (!booking) {
    console.error('Booking not found for failed payment:', payment.merchantTransactionId);
    return;
  }

  // Update booking payment status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'failed',
      payment_timestamp: new Date().toISOString(),
      payment_response: payment,
    })
    .eq('id', booking.id);

  // Update payment transaction
  await supabase
    .from('payment_transactions')
    .upsert({
      transaction_id: payment.transactionId,
      booking_id: booking.id,
      partner_id: booking.partner_id,
      payment_gateway: 'phonepe',
      amount: payment.amount / 100,
      currency: 'INR',
      status: 'failed',
      gateway_response: payment,
    }, {
      onConflict: 'transaction_id',
    });

  console.log('PhonePe payment failure processed:', payment.transactionId);
}

