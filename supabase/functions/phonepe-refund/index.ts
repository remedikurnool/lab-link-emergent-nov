import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import crypto from 'https://deno.land/std@0.168.0/node/crypto.ts';

const PHONEPE_MERCHANT_ID = Deno.env.get('PHONEPE_MERCHANT_ID') || '';
const PHONEPE_SALT_KEY = Deno.env.get('PHONEPE_SALT_KEY') || '';
const PHONEPE_SALT_INDEX = Deno.env.get('PHONEPE_SALT_INDEX') || '1';
const PHONEPE_BASE_URL = Deno.env.get('PHONEPE_BASE_URL') || 'https://api.phonepe.com/apis/hermes';

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

    // Create refund request
    const refundAmount = Math.round(amount * 100); // Convert to paise
    const refundId = `REF${Date.now()}`;

    const refundPayload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: refundId,
      originalTransactionId: payment_id,
      amount: refundAmount,
      callbackUrl: `${Deno.env.get('SUPABASE_URL')}/functions/v1/phonepe-refund-callback`,
    };

    const base64Payload = btoa(JSON.stringify(refundPayload));
    const stringToHash = base64Payload + '/pg/v1/refund' + PHONEPE_SALT_KEY;
    const sha256Hash = crypto.createHash('sha256').update(stringToHash).digest('hex');
    const xVerify = sha256Hash + '###' + PHONEPE_SALT_INDEX;

    // Call PhonePe refund API
    const refundResponse = await fetch(`${PHONEPE_BASE_URL}/v1/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-VERIFY': xVerify,
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    });

    const refundData = await refundResponse.json();

    if (!refundResponse.ok || refundData.code !== 'SUCCESS') {
      return new Response(
        JSON.stringify({
          error: 'PhonePe refund failed',
          details: refundData,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Decode response
    const decodedResponse = atob(refundData.data.response);
    const refundResult = JSON.parse(decodedResponse);

    // Update booking and transaction records
    await supabase
      .from('bookings')
      .update({
        payment_status: 'refunded',
        payment_response: {
          ...booking.payment_response,
          refund: refundResult,
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
          refund: refundResult,
        },
      })
      .eq('transaction_id', payment_id);

    return new Response(
      JSON.stringify({
        success: true,
        refund_id: refundId,
        amount: refundAmount / 100,
        status: refundResult.state,
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

