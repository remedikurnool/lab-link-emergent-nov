// Supabase Edge Function: Verify Razorpay Payment
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { crypto } from 'https://deno.land/std@0.168.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { payment_id, order_id, signature } = await req.json();

    // Get Razorpay configuration
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'razorpay_config')
      .single();

    const config = settings?.value as { enabled: boolean; key_id: string; key_secret: string };

    if (!config?.enabled || !config.key_secret) {
      throw new Error('Razorpay is not configured');
    }

    // Verify signature
    const text = `${order_id}|${payment_id}`;
    const expectedSignature = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(text + config.key_secret)
    );
    const expectedSignatureHex = Array.from(new Uint8Array(expectedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const verified = expectedSignatureHex === signature;

    if (verified) {
      // Update booking payment status
      const { data: booking } = await supabaseClient
        .from('bookings')
        .select('id, partner_id')
        .eq('id', order_id.replace('BK', ''))
        .single();

      if (booking) {
        await supabaseClient
          .from('bookings')
          .update({
            payment_id: payment_id,
            payment_status: 'success',
            payment_gateway: 'razorpay',
            payment_timestamp: new Date().toISOString(),
            payment_response: { order_id, payment_id, signature },
          })
          .eq('id', booking.id);

        // Create payment transaction record
        await supabaseClient.from('payment_transactions').insert({
          booking_id: booking.id,
          partner_id: booking.partner_id,
          transaction_id: payment_id,
          payment_gateway: 'razorpay',
          amount: 0, // Will be updated from booking
          status: 'success',
          gateway_response: { order_id, payment_id, signature },
        });
      }
    }

    return new Response(
      JSON.stringify({ verified }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message, verified: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

