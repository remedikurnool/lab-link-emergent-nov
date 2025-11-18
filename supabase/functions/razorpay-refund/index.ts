import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID') || '';
const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET') || '';
const RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { booking_id, payment_id, amount } = await req.json();

    if (!payment_id || !amount) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get booking details
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: booking } = await supabase
      .from('bookings')
      .select('payment_id, payment_status, total_amount')
      .eq('id', booking_id)
      .single();

    if (!booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (booking.payment_status !== 'success') {
      return new Response(
        JSON.stringify({ error: 'Payment not successful, cannot refund' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create refund via Razorpay API
    const refundAmount = Math.round(amount * 100); // Convert to paise

    const auth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    const refundResponse = await fetch(`${RAZORPAY_BASE_URL}/payments/${payment_id}/refund`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: refundAmount,
        notes: {
          booking_id: booking_id,
          reason: 'Admin initiated refund',
        },
      }),
    });

    const refundData = await refundResponse.json();

    if (!refundResponse.ok) {
      return new Response(
        JSON.stringify({
          error: 'Razorpay refund failed',
          details: refundData,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update booking and transaction records
    await supabase
      .from('bookings')
      .update({
        payment_status: 'refunded',
        payment_response: {
          ...booking.payment_response,
          refund: refundData,
          refunded_at: new Date().toISOString(),
        },
      })
      .eq('id', booking_id);

    await supabase
      .from('payment_transactions')
      .update({
        status: 'refunded',
        gateway_response: {
          ...booking.payment_response,
          refund: refundData,
        },
      })
      .eq('transaction_id', payment_id);

    return new Response(
      JSON.stringify({
        success: true,
        refund_id: refundData.id,
        amount: refundData.amount / 100,
        status: refundData.status,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    console.error('Refund error:', error);
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

