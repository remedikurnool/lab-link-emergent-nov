import { supabase } from '../supabase/client';
import { retry } from '../utils/retry';

export interface SMSMessageParams {
  [key: string]: string | number;
}

/**
 * Send SMS notification
 * Supports Twilio and MSG91 providers
 */
export async function sendSMSNotification(
  phone: string,
  message: string,
  templateId?: string,
  params?: SMSMessageParams
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Get SMS configuration
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'sms_config')
      .single();

    if (settingsError || !settingsData?.value) {
      return { success: false, error: 'SMS not configured' };
    }

    const config = settingsData.value as {
      enabled: boolean;
      provider: 'twilio' | 'msg91';
      twilio_account_sid?: string;
      twilio_auth_token?: string;
      twilio_phone_number?: string;
      msg91_auth_key?: string;
      msg91_sender_id?: string;
      msg91_template_id?: string;
    };

    if (!config.enabled) {
      return { success: false, error: 'SMS notifications are disabled' };
    }

    // Call Edge Function to send SMS with retry logic
    const { data, error } = await retry(
      async () => {
        const result = await supabase.functions.invoke('sms-send', {
          body: {
            to: phone,
            message,
            templateId: templateId || config.msg91_template_id,
            params,
            config: {
              provider: config.provider,
              twilioAccountSid: config.twilio_account_sid,
              twilioAuthToken: config.twilio_auth_token,
              twilioPhoneNumber: config.twilio_phone_number,
              msg91AuthKey: config.msg91_auth_key,
              msg91SenderId: config.msg91_sender_id,
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
      await logNotification('sms', phone, 'SMS Notification', { message }, data.messageId);
    }

    return {
      success: data?.success === true,
      messageId: data?.messageId,
      error: data?.error,
    };
  } catch (error: any) {
    console.error('Error sending SMS notification:', error);
    
    // Log failed notification attempt
    try {
      await logNotification('sms', phone, 'SMS Notification', { message }, undefined, 'failed', error.message);
    } catch (logError) {
      console.error('Error logging failed notification:', logError);
    }
    
    return { success: false, error: error.message || 'Failed to send SMS notification' };
  }
}

/**
 * Log notification to history
 */
async function logNotification(
  type: 'whatsapp' | 'sms' | 'email' | 'push',
  recipient: string,
  subject: string,
  message: SMSMessageParams,
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

