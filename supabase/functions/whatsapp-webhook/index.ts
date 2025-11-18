import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const body = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Handle different webhook events based on provider
    // Twilio webhook format
    if (body.MessageSid || body.SmsSid) {
      await handleTwilioWebhook(body, supabase);
    }
    // Meta Cloud API webhook format
    else if (body.entry) {
      await handleMetaWebhook(body, supabase);
    }
    // Generic webhook
    else {
      await handleGenericWebhook(body, supabase);
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
    console.error('WhatsApp webhook error:', error);
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

async function handleTwilioWebhook(body: any, supabase: any) {
  const messageSid = body.MessageSid || body.SmsSid;
  const status = body.MessageStatus || body.SmsStatus;
  const to = body.To || body.ToNumber;
  const from = body.From || body.FromNumber;

  // Update notification history if message ID exists
  if (messageSid) {
    await supabase
      .from('notification_history')
      .update({
        status: mapTwilioStatus(status),
        provider_response: body,
        sent_at: new Date().toISOString(),
      })
      .eq('provider_response->>messageId', messageSid);

    console.log('Twilio webhook processed:', messageSid, status);
  }
}

async function handleMetaWebhook(body: any, supabase: any) {
  // Meta Cloud API webhook structure
  if (body.entry && body.entry[0] && body.entry[0].changes) {
    for (const change of body.entry[0].changes) {
      if (change.value && change.value.statuses) {
        for (const status of change.value.statuses) {
          const messageId = status.id;
          const statusValue = status.status;

          // Update notification history
          await supabase
            .from('notification_history')
            .update({
              status: mapMetaStatus(statusValue),
              provider_response: status,
              sent_at: new Date().toISOString(),
            })
            .eq('provider_response->>id', messageId);

          console.log('Meta webhook processed:', messageId, statusValue);
        }
      }
    }
  }
}

async function handleGenericWebhook(body: any, supabase: any) {
  // Generic webhook handler for other providers
  const messageId = body.messageId || body.id || body.message_id;
  const status = body.status || body.deliveryStatus;

  if (messageId && status) {
    await supabase
      .from('notification_history')
      .update({
        status: mapGenericStatus(status),
        provider_response: body,
        sent_at: new Date().toISOString(),
      })
      .eq('provider_response->>messageId', messageId)
      .or(`provider_response->>id.eq.${messageId},provider_response->>message_id.eq.${messageId}`);

    console.log('Generic webhook processed:', messageId, status);
  }
}

function mapTwilioStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'queued': 'pending',
    'sent': 'sent',
    'delivered': 'delivered',
    'failed': 'failed',
    'undelivered': 'failed',
  };
  return statusMap[status.toLowerCase()] || 'pending';
}

function mapMetaStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'sent': 'sent',
    'delivered': 'delivered',
    'read': 'delivered',
    'failed': 'failed',
  };
  return statusMap[status.toLowerCase()] || 'pending';
}

function mapGenericStatus(status: string): string {
  const statusLower = status.toLowerCase();
  if (statusLower.includes('delivered') || statusLower.includes('read')) {
    return 'delivered';
  }
  if (statusLower.includes('sent') || statusLower.includes('queued')) {
    return 'sent';
  }
  if (statusLower.includes('failed') || statusLower.includes('error')) {
    return 'failed';
  }
  return 'pending';
}

