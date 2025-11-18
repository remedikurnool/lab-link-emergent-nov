-- In-App Notification System
-- Create notifications table for in-app messaging

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('booking', 'commission', 'system', 'payment', 'report')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_partner_id ON public.notifications(partner_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read, created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Service role can insert notifications
-- No INSERT policy - admin uses service role

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_partner_id UUID DEFAULT NULL,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    partner_id,
    type,
    title,
    message,
    data
  )
  VALUES (
    p_user_id,
    p_partner_id,
    p_type,
    p_title,
    p_message,
    p_data
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(
  p_notification_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.notifications
  SET is_read = true,
      read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = auth.uid();
END;
$$;

-- Function to mark all notifications as read
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read(
  p_user_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE public.notifications
  SET is_read = true,
      read_at = NOW()
  WHERE user_id = p_user_id
    AND is_read = false;
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$;

-- Trigger to create notification on booking status change
CREATE OR REPLACE FUNCTION public.notify_booking_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_partner_user_id UUID;
BEGIN
  -- Get partner's user_id
  SELECT user_id INTO v_partner_user_id
  FROM public.partners
  WHERE id = NEW.partner_id;
  
  IF v_partner_user_id IS NOT NULL AND OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM public.create_notification(
      v_partner_user_id,
      NEW.partner_id,
      'booking',
      'Booking Status Updated',
      'Booking ' || NEW.id || ' status changed from ' || OLD.status || ' to ' || NEW.status,
      jsonb_build_object(
        'booking_id', NEW.id,
        'old_status', OLD.status,
        'new_status', NEW.status
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_booking_status_change_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_booking_status_change();

-- Trigger to create notification on commission status change
CREATE OR REPLACE FUNCTION public.notify_commission_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_partner_user_id UUID;
BEGIN
  -- Get partner's user_id
  SELECT user_id INTO v_partner_user_id
  FROM public.partners
  WHERE id = NEW.partner_id;
  
  IF v_partner_user_id IS NOT NULL AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'paid' THEN
    PERFORM public.create_notification(
      v_partner_user_id,
      NEW.partner_id,
      'commission',
      'Commission Paid',
      'Commission of ' || NEW.amount || ' has been paid for booking ' || NEW.booking_id,
      jsonb_build_object(
        'commission_id', NEW.id,
        'booking_id', NEW.booking_id,
        'amount', NEW.amount
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_commission_status_change_trigger
  AFTER UPDATE ON public.commissions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'paid')
  EXECUTE FUNCTION public.notify_commission_status_change();

