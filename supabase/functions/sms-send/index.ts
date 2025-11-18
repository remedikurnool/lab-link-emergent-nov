// Supabase Edge Function: Send SMS
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { to, message, templateId, params, config } = await req.json();

    let result;

    if (config.provider === 'twilio') {
      // Twilio SMS API
      const accountSid = config.twilioAccountSid;
      const authToken = config.twilioAuthToken;
      const from = config.twilioPhoneNumber;

      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      
      const formData = new URLSearchParams();
      formData.append('From', from);
      formData.append('To', to);
      formData.append('Body', message || formatTemplate(templateId, params));

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
        throw new Error(data.message || 'Failed to send SMS');
      }

      result = { success: true, messageId: data.sid };
    } else {
      // MSG91 SMS API
      const authKey = config.msg91AuthKey;
      const senderId = config.msg91SenderId;
      const templateIdToUse = templateId || config.msg91TemplateId;

      const msg91Url = 'https://control.msg91.com/api/v5/flow/';
      
      const payload = {
        template_id: templateIdToUse,
        sender: senderId,
        short_url: '0',
        mobiles: to,
        ...params,
      };

      const response = await fetch(msg91Url, {
        method: 'POST',
        headers: {
          'authkey': authKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || data.type !== 'success') {
        throw new Error(data.message || 'Failed to send SMS');
      }

      result = { success: true, messageId: data.request_id };
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

function formatTemplate(templateId: string, params: Record<string, any>): string {
  // Simple template formatting
  let message = 'Notification from Lab Link';
  if (params && Object.keys(params).length > 0) {
    message = Object.values(params).join(' ');
  }
  return message;
}

