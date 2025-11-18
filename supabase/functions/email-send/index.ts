// Supabase Edge Function: Send Email
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
    const { to, subject, html, text, templateId, templateParams, config } = await req.json();

    let result;

    if (config.provider === 'resend') {
      // Resend Email API
      const apiKey = config.resendApiKey;
      const from = config.resendFromEmail;

      const resendUrl = 'https://api.resend.com/emails';
      
      const payload: any = {
        from: from,
        to: [to],
        subject: subject,
      };

      if (html) {
        payload.html = html;
      }
      if (text) {
        payload.text = text;
      }

      const response = await fetch(resendUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send email');
      }

      result = { success: true, messageId: data.id };
    } else {
      // SendGrid Email API
      const apiKey = config.sendgridApiKey;
      const from = config.sendgridFromEmail;

      const sendgridUrl = 'https://api.sendgrid.com/v3/mail/send';
      
      const payload = {
        personalizations: [{
          to: [{ email: to }],
          subject: subject,
        }],
        from: { email: from },
        content: [
          {
            type: html ? 'text/html' : 'text/plain',
            value: html || text || '',
          },
        ],
      };

      const response = await fetch(sendgridUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to send email');
      }

      // SendGrid doesn't return message ID in response
      result = { success: true, messageId: `sg-${Date.now()}` };
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

