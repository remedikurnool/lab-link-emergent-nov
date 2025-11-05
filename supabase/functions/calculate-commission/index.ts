// Supabase Edge Function: Calculate Commission
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

    const { bookingId } = await req.json();

    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (bookingError) throw bookingError;

    const { data: partner } = await supabaseClient
      .from('partners')
      .select('commission_percentage')
      .eq('id', booking.partner_id)
      .single();

    const commissionAmount = (booking.total_amount * partner.commission_percentage) / 100;

    const { data: commission } = await supabaseClient
      .from('commissions')
      .insert({
        partner_id: booking.partner_id,
        booking_id: bookingId,
        amount: commissionAmount,
        status: 'pending',
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({ success: true, commission }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
