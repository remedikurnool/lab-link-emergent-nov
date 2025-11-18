-- Time Slot Management System
-- Create slots table for managing booking time slots

CREATE TABLE IF NOT EXISTS public.time_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  diagnostic_centre_id UUID REFERENCES public.diagnostic_centres(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(diagnostic_centre_id, date, start_time, end_time)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_time_slots_centre_date ON public.time_slots(diagnostic_centre_id, date);
CREATE INDEX IF NOT EXISTS idx_time_slots_available ON public.time_slots(is_available, date) WHERE is_available = true;

-- RLS for time_slots
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;

-- Partners can view available slots
CREATE POLICY "Partners can view available slots" ON public.time_slots
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partners
      WHERE partners.user_id = auth.uid()
    )
  );

-- Service role can manage slots (admin)
-- No INSERT/UPDATE policy - admin uses service role

-- Function to check slot availability
CREATE OR REPLACE FUNCTION public.check_slot_availability(
  p_centre_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot RECORD;
BEGIN
  SELECT * INTO v_slot
  FROM public.time_slots
  WHERE diagnostic_centre_id = p_centre_id
    AND date = p_date
    AND start_time = p_start_time
    AND end_time = p_end_time
    AND is_available = true
    AND current_bookings < max_bookings;
  
  RETURN v_slot IS NOT NULL;
END;
$$;

-- Function to reserve a slot
CREATE OR REPLACE FUNCTION public.reserve_slot(
  p_centre_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot_id UUID;
BEGIN
  -- Find available slot
  SELECT id INTO v_slot_id
  FROM public.time_slots
  WHERE diagnostic_centre_id = p_centre_id
    AND date = p_date
    AND start_time = p_start_time
    AND end_time = p_end_time
    AND is_available = true
    AND current_bookings < max_bookings
  FOR UPDATE SKIP LOCKED
  LIMIT 1;
  
  IF v_slot_id IS NULL THEN
    RAISE EXCEPTION 'Slot not available';
  END IF;
  
  -- Increment booking count
  UPDATE public.time_slots
  SET current_bookings = current_bookings + 1,
      updated_at = NOW()
  WHERE id = v_slot_id;
  
  -- Mark as unavailable if max reached
  UPDATE public.time_slots
  SET is_available = false
  WHERE id = v_slot_id
    AND current_bookings >= max_bookings;
  
  RETURN v_slot_id;
END;
$$;

-- Function to release a slot
CREATE OR REPLACE FUNCTION public.release_slot(
  p_slot_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.time_slots
  SET current_bookings = GREATEST(0, current_bookings - 1),
      is_available = true,
      updated_at = NOW()
  WHERE id = p_slot_id;
END;
$$;

-- Add slot_id to bookings table
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS slot_id UUID REFERENCES public.time_slots(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON public.bookings(slot_id);

-- Trigger to release slot when booking is cancelled
CREATE OR REPLACE FUNCTION public.release_slot_on_cancel()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' AND OLD.slot_id IS NOT NULL THEN
    PERFORM public.release_slot(OLD.slot_id);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER release_slot_trigger
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'cancelled')
  EXECUTE FUNCTION public.release_slot_on_cancel();

