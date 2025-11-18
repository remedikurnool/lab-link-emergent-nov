// Supabase Edge Function: Initiate PhonePe Payment
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

    const { amount, merchantTransactionId, merchantUserId, callbackUrl, redirectUrl, redirectMode, mobileNumber, paymentInstrument } = await req.json();

    // Get PhonePe configuration
    const { data: settings } = await supabaseClient
      .from('settings')
      .select('value')
      .eq('key', 'phonepe_config')
      .single();

    const config = settings?.value as { enabled: boolean; merchant_id: string; salt_key: string; salt_index: string };

    if (!config?.enabled || !config.merchant_id || !config.salt_key) {
      throw new Error('PhonePe is not configured');
    }

    // Create payment request
    const baseUrl = 'https://api-preprod.phonepe.com/apis/pg-sandbox'; // Use api.phonepe.com for production
    const apiEndpoint = '/pg/v1/pay';
    
    const payload = {
      merchantId: config.merchant_id,
      merchantTransactionId,
      merchantUserId,
      amount: amount,
      redirectUrl,
      redirectMode,
      callbackUrl,
      mobileNumber,
      paymentInstrument,
    };

    // Create X-VERIFY header
    const payloadString = JSON.stringify(payload);
    const base64Payload = btoa(payloadString);
    const stringToHash = `${base64Payload}${apiEndpoint}${config.salt_key}`;
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(stringToHash));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const xVerify = `${hashHex}###${config.salt_index}`;

    // Make API call
    const response = await fetch(`${baseUrl}${apiEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'Accept': 'application/json',
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const data = await response.json();

    if (!response.ok || data.success !== true) {
      throw new Error(data.message || 'Failed to create PhonePe payment');
    }

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

