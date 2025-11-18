import { supabase } from '../supabase/client';
import { retry } from '../utils/retry';

export interface WhatsAppMessageParams {
  [key: string]: string | number;
}

/**
 * Send WhatsApp notification via WhatsApp Business API
 * Supports multiple providers (Twilio, Meta Cloud API, etc.)
 */
export async function sendWhatsAppNotification(
  phone: string,
  templateName: string,
  params: WhatsAppMessageParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Get WhatsApp configuration
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'whatsapp_config')
      .single();

    if (settingsError || !settingsData?.value) {
      return { success: false, error: 'WhatsApp not configured' };
    }

    const config = settingsData.value as {
      enabled: boolean;
      provider?: string;
      business_phone?: string;
      api_key?: string;
      account_sid?: string; // For Twilio
      auth_token?: string; // For Twilio
      template_id?: string;
    };

    if (!config.enabled) {
      return { success: false, error: 'WhatsApp notifications are disabled' };
    }

    // Call Edge Function to send WhatsApp message with retry logic
    const { data, error } = await retry(
      async () => {
        const result = await supabase.functions.invoke('whatsapp-send', {
          body: {
            to: phone,
            templateName,
            params,
            config: {
              provider: config.provider || 'twilio',
              apiKey: config.api_key,
              accountSid: config.account_sid,
              authToken: config.auth_token,
              businessPhone: config.business_phone,
              templateId: config.template_id,
            },
          },
        });
        if (result.error) throw result.error;
        return result;
      },
      {
        maxAttempts: 3,
        delay: 1000,
        retryable: (err: any) => {
          // Retry on network errors and 5xx errors
          return err?.code === 'NETWORK_ERROR' || 
                 err?.status >= 500 || 
                 err?.message?.includes('network') ||
                 err?.message?.includes('timeout');
        },
      }
    );

    if (error) throw error;

    // Log notification to history
    if (data?.success) {
      await logNotification('whatsapp', phone, templateName, params, data.messageId);
    }

    return {
      success: data?.success === true,
      messageId: data?.messageId,
      error: data?.error,
    };
  } catch (error: any) {
    console.error('Error sending WhatsApp notification:', error);
    
    // Log failed notification attempt
    try {
      await logNotification('whatsapp', phone, templateName, params, undefined, 'failed', error.message);
    } catch (logError) {
      console.error('Error logging failed notification:', logError);
    }
    
    return { success: false, error: error.message || 'Failed to send WhatsApp notification' };
  }
}

/**
 * Log notification to history
 */
async function logNotification(
  type: 'whatsapp' | 'sms' | 'email' | 'push',
  recipient: string,
  subject: string,
  message: WhatsAppMessageParams,
  messageId?: string,
  status: 'sent' | 'failed' = 'sent',
  errorMessage?: string
) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: partner } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!partner) return;

    await supabase.from('notification_history').insert({
      partner_id: partner.id,
      notification_type: type,
      recipient,
      subject: subject,
      message: JSON.stringify(message),
      status,
      provider_response: messageId ? { messageId } : errorMessage ? { error: errorMessage } : null,
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging notification:', error);
  }
}

