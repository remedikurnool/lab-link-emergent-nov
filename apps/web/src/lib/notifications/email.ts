import { supabase } from '../supabase/client';
import { retry } from '../utils/retry';

export interface EmailMessageParams {
  [key: string]: string | number;
}

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateParams?: EmailMessageParams;
}

/**
 * Send email notification
 * Supports Resend and SendGrid providers
 */
export async function sendEmailNotification(
  options: EmailOptions
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Get Email configuration
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'email_config')
      .single();

    if (settingsError || !settingsData?.value) {
      return { success: false, error: 'Email not configured' };
    }

    const config = settingsData.value as {
      enabled: boolean;
      provider: 'resend' | 'sendgrid';
      resend_api_key?: string;
      resend_from_email?: string;
      sendgrid_api_key?: string;
      sendgrid_from_email?: string;
    };

    if (!config.enabled) {
      return { success: false, error: 'Email notifications are disabled' };
    }

    // Call Edge Function to send email with retry logic
    const { data, error } = await retry(
      async () => {
        const result = await supabase.functions.invoke('email-send', {
          body: {
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
            templateId: options.templateId,
            templateParams: options.templateParams,
            config: {
              provider: config.provider,
              resendApiKey: config.resend_api_key,
              resendFromEmail: config.resend_from_email,
              sendgridApiKey: config.sendgrid_api_key,
              sendgridFromEmail: config.sendgrid_from_email,
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
      await logNotification(
        'email',
        options.to,
        options.subject,
        { html: options.html, text: options.text, ...options.templateParams },
        data.messageId
      );
    }

    return {
      success: data?.success === true,
      messageId: data?.messageId,
      error: data?.error,
    };
  } catch (error: any) {
    console.error('Error sending email notification:', error);
    
    // Log failed notification attempt
    try {
      await logNotification(
        'email',
        options.to,
        options.subject,
        { html: options.html, text: options.text, ...options.templateParams },
        undefined,
        'failed',
        error.message
      );
    } catch (logError) {
      console.error('Error logging failed notification:', logError);
    }
    
    return { success: false, error: error.message || 'Failed to send email notification' };
  }
}

/**
 * Log notification to history
 */
async function logNotification(
  type: 'whatsapp' | 'sms' | 'email' | 'push',
  recipient: string,
  subject: string,
  message: EmailMessageParams,
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

