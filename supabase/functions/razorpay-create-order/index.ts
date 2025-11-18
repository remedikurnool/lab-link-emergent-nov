// Supabase Edge Function: Create Razorpay Order
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    const { amount, currency, receipt, notes } = await req.json();

    // Get Razorpay configuration
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'razorpay_config')
      .single();

    const config = settings?.value as { enabled: boolean; key_id: string; key_secret: string };

    if (!config?.enabled || !config.key_id || !config.key_secret) {
      throw new Error('Razorpay is not configured');
    }

    // Create order via Razorpay API
    const orderData = {
      amount: amount,
      currency: currency || 'INR',
      receipt: receipt,
      notes: notes || {},
    };

    const auth = btoa(`${config.key_id}:${config.key_secret}`);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`,
      },
      body: JSON.stringify(orderData),
    });

    const order = await response.json();

    if (!response.ok) {
      throw new Error(order.error?.description || 'Failed to create Razorpay order');
    }

    return new Response(
      JSON.stringify({ success: true, order }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

