-- Notification Settings and Preferences
-- Add SMS and Email configurations to settings table
INSERT INTO public.settings (key, value) VALUES
  ('sms_config', '{
    "enabled": false,
    "provider": "twilio",
    "twilio_account_sid": "",
    "twilio_auth_token": "",
    "twilio_phone_number": "",
    "msg91_auth_key": "",
    "msg91_sender_id": "",
    "msg91_template_id": ""
  }'),
  ('email_config', '{
    "enabled": false,
    "provider": "resend",
    "resend_api_key": "",
    "resend_from_email": "",
    "sendgrid_api_key": "",
    "sendgrid_from_email": ""
  }')
ON CONFLICT (key) DO NOTHING;

-- Add notification preferences to partners table
ALTER TABLE public.partners 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "whatsapp": true,
  "sms": true,
  "email": true,
  "push": true
}'::jsonb;

-- Create notification_history table
CREATE TABLE IF NOT EXISTS public.notification_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('whatsapp', 'sms', 'email', 'push')),
  recipient TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'delivered')),
  provider_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_history_partner_id ON public.notification_history(partner_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_booking_id ON public.notification_history(booking_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_status ON public.notification_history(status);
CREATE INDEX IF NOT EXISTS idx_notification_history_type ON public.notification_history(notification_type);

-- RLS for notification_history
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Partners can view their own notifications
CREATE POLICY "Partners view own notifications" ON public.notification_history
  FOR SELECT USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

-- Public can insert (for system notifications)
CREATE POLICY "Public insert notifications" ON public.notification_history
  FOR INSERT WITH CHECK (true);

