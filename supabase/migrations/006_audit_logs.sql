-- Audit Logging for Admin Actions
-- Create audit_logs table for tracking critical operations

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON public.audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- RLS for audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can insert (for logging)
CREATE POLICY "Authenticated insert audit logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only service role can read (admin access via service role)
-- No SELECT policy - admin uses service role key

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO public.audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    details
  )
  VALUES (
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_details
  )
  RETURNING id INTO v_audit_id;
  
  RETURN v_audit_id;
END;
$$;

-- Triggers for critical table changes
-- Booking status changes
CREATE OR REPLACE FUNCTION public.audit_booking_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM public.log_audit_event(
      'booking_status_changed',
      'booking',
      NEW.id::TEXT,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'booking_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_booking_status_changes
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.audit_booking_changes();

-- Commission status changes
CREATE OR REPLACE FUNCTION public.audit_commission_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    PERFORM public.log_audit_event(
      'commission_status_changed',
      'commission',
      NEW.id::TEXT,
      jsonb_build_object(
        'old_status', OLD.status,
        'new_status', NEW.status,
        'commission_id', NEW.id,
        'amount', NEW.amount
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_commission_status_changes
  AFTER UPDATE ON public.commissions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.audit_commission_changes();

-- Partner status changes
CREATE OR REPLACE FUNCTION public.audit_partner_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (OLD.is_active IS DISTINCT FROM NEW.is_active) THEN
    PERFORM public.log_audit_event(
      'partner_status_changed',
      'partner',
      NEW.id::TEXT,
      jsonb_build_object(
        'old_status', OLD.is_active,
        'new_status', NEW.is_active,
        'partner_id', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_partner_status_changes
  AFTER UPDATE ON public.partners
  FOR EACH ROW
  WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
  EXECUTE FUNCTION public.audit_partner_status_changes();

-- Settings changes (admin configurations)
CREATE OR REPLACE FUNCTION public.audit_settings_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM public.log_audit_event(
    'settings_updated',
    'settings',
    NEW.key,
    jsonb_build_object(
      'key', NEW.key,
      'old_value', OLD.value,
      'new_value', NEW.value
    )
  );
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER audit_settings_changes
  AFTER UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_settings_changes();

