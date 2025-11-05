-- Lab Link Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- DIAGNOSTIC CENTRES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.diagnostic_centres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  rating DECIMAL(2,1) DEFAULT 4.5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  sample_type TEXT,
  tests_included INTEGER DEFAULT 1,
  parameters JSONB,
  preparation_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SCANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  preparation_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  tests_included INTEGER,
  included_tests JSONB,
  popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- CENTRE PRICING TABLE (Multi-Centre Pricing)
-- ============================================
CREATE TABLE IF NOT EXISTS public.centre_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES public.diagnostic_centres(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('test', 'scan', 'package')),
  item_id UUID NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  discount INTEGER,
  report_delivery_time TEXT DEFAULT '24 hours',
  home_collection BOOLEAN DEFAULT false,
  partner_commission_percentage DECIMAL(5,2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(centre_id, item_type, item_id)
);

-- ============================================
-- PARTNERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  partner_type TEXT NOT NULL CHECK (partner_type IN ('pharmacist', 'nurse', 'asha_worker', 'technician', 'medical_representative', 'other')),
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  bank_name TEXT,
  account_number TEXT,
  ifsc_code TEXT,
  upi_id TEXT,
  commission_percentage DECIMAL(5,2) DEFAULT 10.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PATIENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.partners(id),
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT CHECK (relationship IN ('self', 'mother', 'father', 'spouse', 'child', 'other')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  partner_id UUID REFERENCES public.partners(id),
  patient_id UUID REFERENCES public.patients(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  partner_commission DECIMAL(10,2),
  collection_type TEXT CHECK (collection_type IN ('home', 'lab')),
  collection_date DATE NOT NULL,
  time_slot TEXT CHECK (time_slot IN ('morning', 'afternoon', 'evening')),
  collection_address TEXT,
  collection_city TEXT,
  collection_pincode TEXT,
  collection_landmark TEXT,
  payment_method TEXT CHECK (payment_method IN ('prepaid', 'pay_at_lab')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'sample_collected', 'in_progress', 'completed', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- COMMISSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.partners(id),
  booking_id TEXT REFERENCES public.bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- PAYOUTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.partners(id),
  amount DECIMAL(10,2) NOT NULL,
  commission_ids JSONB,
  payment_method TEXT,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_tests_active ON public.tests(is_active);
CREATE INDEX IF NOT EXISTS idx_scans_active ON public.scans(is_active);
CREATE INDEX IF NOT EXISTS idx_packages_active ON public.packages(is_active);
CREATE INDEX IF NOT EXISTS idx_centre_pricing_centre ON public.centre_pricing(centre_id);
CREATE INDEX IF NOT EXISTS idx_centre_pricing_item ON public.centre_pricing(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_partner ON public.bookings(partner_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON public.commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Public read access for catalogue tables
ALTER TABLE public.diagnostic_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centre_pricing ENABLE ROW LEVEL SECURITY;

-- Public can read active tests, scans, packages
CREATE POLICY "Public read active tests" ON public.tests
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active scans" ON public.scans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active packages" ON public.packages
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active centres" ON public.diagnostic_centres
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public read active pricing" ON public.centre_pricing
  FOR SELECT USING (is_active = true);

-- Partners can read their own data
CREATE POLICY "Partners read own data" ON public.partners
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Partners update own data" ON public.partners
  FOR UPDATE USING (auth.uid() = user_id);

-- Partners can read their own patients
CREATE POLICY "Partners read own patients" ON public.patients
  FOR SELECT USING (
    partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Partners create patients" ON public.patients
  FOR INSERT WITH CHECK (
    partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

-- Partners can read their own bookings
CREATE POLICY "Partners read own bookings" ON public.bookings
  FOR SELECT USING (
    partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Partners create bookings" ON public.bookings
  FOR INSERT WITH CHECK (
    partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

-- Partners can read their own commissions
CREATE POLICY "Partners read own commissions" ON public.commissions
  FOR SELECT USING (
    partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );

-- Partners can read their own payouts
CREATE POLICY "Partners read own payouts" ON public.payouts
  FOR SELECT USING (
    partner_id IN (
      SELECT id FROM public.partners WHERE user_id = auth.uid()
    )
  );
