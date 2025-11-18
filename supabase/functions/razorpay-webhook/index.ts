import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import crypto from 'https://deno.land/std@0.168.0/node/crypto.ts';

const RAZORPAY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';

interface RazorpayWebhookPayload {
  event: string;
  payload: {
    payment: {
      entity: {
        id: string;
        amount: number;
        currency: string;
        status: string;
        order_id: string;
        method: string;
        created_at: number;
      };
    };
    order: {
      entity: {
        id: string;
        amount: number;
        status: string;
      };
    };
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
      },
    });
  }

  try {
    const signature = req.headers.get('x-razorpay-signature');
    const body = await req.text();

    if (!signature) {
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload: RazorpayWebhookPayload = JSON.parse(body);
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different webhook events
    switch (payload.event) {
      case 'payment.captured':
      case 'payment.authorized':
        await handlePaymentSuccess(payload, supabase);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload, supabase);
        break;
      case 'payment.refunded':
        await handlePaymentRefunded(payload, supabase);
        break;
      default:
        console.log(`Unhandled webhook event: ${payload.event}`);
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
  payload: RazorpayWebhookPayload,
  supabase: any
) {
  const payment = payload.payload.payment.entity;
  const order = payload.payload.order.entity;

  // Find booking by order_id or payment_id
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('id, partner_id, total_amount')
    .or(`payment_id.eq.${payment.id},payment_id.eq.${order.id}`)
    .single();

  if (bookingError || !booking) {
    console.error('Booking not found for payment:', payment.id);
    return;
  }

  // Update booking payment status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'success',
      payment_timestamp: new Date(payment.created_at * 1000).toISOString(),
      payment_response: payment,
      status: 'confirmed',
    })
    .eq('id', booking.id);

  // Create or update payment transaction
  await supabase
    .from('payment_transactions')
    .upsert({
      transaction_id: payment.id,
      booking_id: booking.id,
      partner_id: booking.partner_id,
      payment_gateway: 'razorpay',
      amount: payment.amount / 100, // Razorpay amounts are in paise
      currency: payment.currency,
      status: 'success',
      gateway_response: payment,
    }, {
      onConflict: 'transaction_id',
    });

  console.log('Payment success processed:', payment.id);
}

async function handlePaymentFailed(
  payload: RazorpayWebhookPayload,
  supabase: any
) {
  const payment = payload.payload.payment.entity;

  // Find booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, partner_id')
    .or(`payment_id.eq.${payment.id}`)
    .single();

  if (!booking) {
    console.error('Booking not found for failed payment:', payment.id);
    return;
  }

  // Update booking payment status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'failed',
      payment_timestamp: new Date(payment.created_at * 1000).toISOString(),
      payment_response: payment,
    })
    .eq('id', booking.id);

  // Update payment transaction
  await supabase
    .from('payment_transactions')
    .upsert({
      transaction_id: payment.id,
      booking_id: booking.id,
      partner_id: booking.partner_id,
      payment_gateway: 'razorpay',
      amount: payment.amount / 100,
      currency: payment.currency,
      status: 'failed',
      gateway_response: payment,
    }, {
      onConflict: 'transaction_id',
    });

  console.log('Payment failure processed:', payment.id);
}

async function handlePaymentRefunded(
  payload: RazorpayWebhookPayload,
  supabase: any
) {
  const payment = payload.payload.payment.entity;

  // Find booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, partner_id')
    .or(`payment_id.eq.${payment.id}`)
    .single();

  if (!booking) {
    console.error('Booking not found for refunded payment:', payment.id);
    return;
  }

  // Update booking payment status
  await supabase
    .from('bookings')
    .update({
      payment_status: 'refunded',
      payment_response: payment,
    })
    .eq('id', booking.id);

  // Update payment transaction
  await supabase
    .from('payment_transactions')
    .update({
      status: 'refunded',
      gateway_response: payment,
    })
    .eq('transaction_id', payment.id);

  console.log('Payment refund processed:', payment.id);
}

