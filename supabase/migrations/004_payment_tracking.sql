-- Payment Tracking and Transaction Management
-- Add payment columns to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'success', 'failed', 'refunded', 'cancelled')),
ADD COLUMN IF NOT EXISTS payment_gateway TEXT CHECK (payment_gateway IN ('razorpay', 'phonepe', 'cash', 'pay_at_lab')),
ADD COLUMN IF NOT EXISTS payment_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_response JSONB;

-- Create payment_transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES public.partners(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE NOT NULL,
  payment_gateway TEXT NOT NULL CHECK (payment_gateway IN ('razorpay', 'phonepe')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL CHECK (status IN ('initiated', 'processing', 'success', 'failed', 'refunded', 'cancelled')),
  gateway_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_transactions_booking_id ON public.payment_transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_partner_id ON public.payment_transactions(partner_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON public.payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);

-- RLS for payment_transactions
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Partners can view their own transactions
CREATE POLICY "Partners view own transactions" ON public.payment_transactions
  FOR SELECT USING (
    partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
  );

-- Public can insert (for webhooks)
CREATE POLICY "Public insert transactions" ON public.payment_transactions
  FOR INSERT WITH CHECK (true);

-- Admin can view all (handled via service role)
-- No policy needed as admin uses service role key

