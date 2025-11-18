// Supabase Edge Function: Send WhatsApp Message
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
    const { to, templateName, params, config } = await req.json();

    let result;

    if (config.provider === 'twilio') {
      // Twilio WhatsApp API
      const accountSid = config.accountSid || config.apiKey;
      const authToken = config.authToken;
      const from = config.businessPhone || `whatsapp:${config.businessPhone}`;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      const formData = new URLSearchParams();
      formData.append('From', from);
      formData.append('To', `whatsapp:${to}`);
      formData.append('Body', formatTemplate(templateName, params));

      const response = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send WhatsApp message');
      }

      result = { success: true, messageId: data.sid };
    } else {
      // Meta Cloud API (or other providers)
      const apiKey = config.apiKey;
      const phoneNumberId = config.businessPhone;
      const templateId = config.templateId;

      const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: { code: 'en' },
            components: formatMetaTemplateParams(params),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Failed to send WhatsApp message');
      }

      result = { success: true, messageId: data.messages[0]?.id };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});

function formatTemplate(templateName: string, params: Record<string, any>): string {
  // Simple template formatting - replace placeholders
  let message = getTemplateMessage(templateName);
  Object.keys(params).forEach(key => {
    message = message.replace(`{{${key}}}`, params[key]);
  });
  return message;
}

function formatMetaTemplateParams(params: Record<string, any>) {
  return [{
    type: 'body',
    parameters: Object.values(params).map(value => ({
      type: 'text',
      text: String(value),
    })),
  }];
}

function getTemplateMessage(templateName: string): string {
  const templates: Record<string, string> = {
    booking_confirmation: 'Your booking {{bookingId}} has been confirmed. Amount: ₹{{amount}}',
    booking_status_update: 'Your booking {{bookingId}} status has been updated to {{status}}',
    commission_earned: 'Congratulations! You earned ₹{{amount}} commission for booking {{bookingId}}',
  };
  return templates[templateName] || 'Notification from Lab Link';
}

