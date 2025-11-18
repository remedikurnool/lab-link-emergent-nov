-- Recurring Bookings Feature
-- Create table for managing recurring bookings

CREATE TABLE IF NOT EXISTS public.recurring_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_booking_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_partner_id ON public.recurring_bookings(partner_id);
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_next_date ON public.recurring_bookings(next_booking_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_recurring_bookings_active ON public.recurring_bookings(is_active) WHERE is_active = true;

-- RLS for recurring_bookings
ALTER TABLE public.recurring_bookings ENABLE ROW LEVEL SECURITY;

-- Partners can view their own recurring bookings
CREATE POLICY "Partners can view own recurring bookings" ON public.recurring_bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.partners
      WHERE partners.id = recurring_bookings.partner_id
        AND partners.user_id = auth.uid()
    )
  );

-- Partners can create recurring bookings
CREATE POLICY "Partners can create recurring bookings" ON public.recurring_bookings
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partners
      WHERE partners.id = recurring_bookings.partner_id
        AND partners.user_id = auth.uid()
    )
  );

-- Partners can update their own recurring bookings
CREATE POLICY "Partners can update own recurring bookings" ON public.recurring_bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.partners
      WHERE partners.id = recurring_bookings.partner_id
        AND partners.user_id = auth.uid()
    )
  );

-- Function to create booking from recurring booking
CREATE OR REPLACE FUNCTION public.create_booking_from_recurring(
  p_recurring_booking_id UUID
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recurring_booking RECORD;
  v_booking_id TEXT;
  v_next_date DATE;
BEGIN
  -- Get recurring booking details
  SELECT * INTO v_recurring_booking
  FROM public.recurring_bookings
  WHERE id = p_recurring_booking_id
    AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Recurring booking not found or inactive';
  END IF;
  
  IF v_recurring_booking.next_booking_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Next booking date has not arrived yet';
  END IF;
  
  -- Generate booking ID
  v_booking_id := 'BK' || EXTRACT(EPOCH FROM NOW())::BIGINT;
  
  -- Create booking
  INSERT INTO public.bookings (
    id,
    partner_id,
    patient_id,
    items,
    total_amount,
    status,
    payment_method,
    collection_type,
    collection_date,
    time_slot
  )
  VALUES (
    v_booking_id,
    v_recurring_booking.partner_id,
    v_recurring_booking.patient_id,
    v_recurring_booking.items,
    v_recurring_booking.total_amount,
    'pending',
    'pay_at_lab',
    'home',
    v_recurring_booking.next_booking_date,
    'morning'
  );
  
  -- Calculate next booking date
  CASE v_recurring_booking.frequency
    WHEN 'daily' THEN
      v_next_date := v_recurring_booking.next_booking_date + INTERVAL '1 day';
    WHEN 'weekly' THEN
      v_next_date := v_recurring_booking.next_booking_date + INTERVAL '1 week';
    WHEN 'monthly' THEN
      v_next_date := v_recurring_booking.next_booking_date + INTERVAL '1 month';
    ELSE
      v_next_date := NULL; -- Custom frequency handled separately
  END CASE;
  
  -- Update recurring booking
  IF v_next_date IS NOT NULL AND (v_recurring_booking.end_date IS NULL OR v_next_date <= v_recurring_booking.end_date) THEN
    UPDATE public.recurring_bookings
    SET next_booking_date = v_next_date,
        updated_at = NOW()
    WHERE id = p_recurring_booking_id;
  ELSE
    -- Recurring booking completed
    UPDATE public.recurring_bookings
    SET is_active = false,
        updated_at = NOW()
    WHERE id = p_recurring_booking_id;
  END IF;
  
  RETURN v_booking_id;
END;
$$;

-- Function to process all due recurring bookings
CREATE OR REPLACE FUNCTION public.process_due_recurring_bookings()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_recurring_booking RECORD;
  v_count INTEGER := 0;
BEGIN
  -- Find all recurring bookings due today
  FOR v_recurring_booking IN
    SELECT id
    FROM public.recurring_bookings
    WHERE is_active = true
      AND next_booking_date <= CURRENT_DATE
      AND (end_date IS NULL OR next_booking_date <= end_date)
  LOOP
    BEGIN
      PERFORM public.create_booking_from_recurring(v_recurring_booking.id);
      v_count := v_count + 1;
    EXCEPTION
      WHEN OTHERS THEN
        -- Log error but continue processing
        RAISE WARNING 'Failed to process recurring booking %: %', v_recurring_booking.id, SQLERRM;
    END;
  END LOOP;
  
  RETURN v_count;
END;
$$;

