# 🚀 Quick Supabase Setup - Copy & Paste Method

## STEP 1: Create All Tables (1 minute)

**Go to:** Supabase Dashboard → SQL Editor → New Query

**Copy and paste this ENTIRE script, then click RUN:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Diagnostic Centres
CREATE TABLE IF NOT EXISTS public.diagnostic_centres (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  city TEXT,
  phone TEXT,
  address TEXT,
  rating DECIMAL(2,1) DEFAULT 4.5,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tests
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scans
CREATE TABLE IF NOT EXISTS public.scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  preparation_instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Packages
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  tests_included INTEGER,
  included_tests JSONB,
  popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Centre Pricing (Multi-Centre Pricing)
CREATE TABLE IF NOT EXISTS public.centre_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  centre_id UUID REFERENCES public.diagnostic_centres(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('test', 'scan', 'package')),
  item_id UUID NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),\n  discount INTEGER,
  report_delivery_time TEXT DEFAULT '24 hours',
  home_collection BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(centre_id, item_type, item_id)
);

-- Partners
CREATE TABLE IF NOT EXISTS public.partners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  partner_type TEXT NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Patients
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.partners(id),
  full_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id TEXT PRIMARY KEY,
  partner_id UUID REFERENCES public.partners(id),
  patient_id UUID REFERENCES public.patients(id),
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  partner_commission DECIMAL(10,2),
  collection_type TEXT,
  collection_date DATE NOT NULL,
  time_slot TEXT,
  collection_address TEXT,
  collection_city TEXT,
  collection_pincode TEXT,
  collection_landmark TEXT,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commissions
CREATE TABLE IF NOT EXISTS public.commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID REFERENCES public.partners(id),
  booking_id TEXT REFERENCES public.bookings(id),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_tests_active ON public.tests(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_partner ON public.bookings(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON public.commissions(partner_id);

-- Enable RLS
ALTER TABLE public.diagnostic_centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centre_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public Read
CREATE POLICY \"Public read centres\" ON public.diagnostic_centres FOR SELECT USING (is_active = true);
CREATE POLICY \"Public read tests\" ON public.tests FOR SELECT USING (is_active = true);
CREATE POLICY \"Public read scans\" ON public.scans FOR SELECT USING (is_active = true);
CREATE POLICY \"Public read packages\" ON public.packages FOR SELECT USING (is_active = true);
CREATE POLICY \"Public read pricing\" ON public.centre_pricing FOR SELECT USING (is_active = true);

-- RLS Policies - Partner Access
CREATE POLICY \"Partners read own profile\" ON public.partners FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY \"Partners update own profile\" ON public.partners FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY \"Partners manage patients\" ON public.patients FOR ALL USING (
  partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
);

CREATE POLICY \"Partners manage bookings\" ON public.bookings FOR ALL USING (
  partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
);

CREATE POLICY \"Partners read commissions\" ON public.commissions FOR SELECT USING (
  partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid())
);
```

**✅ Click RUN - Tables created!**

---

## STEP 2: Add Sample Data (30 seconds)

**New Query → Copy & Paste → RUN:**

```sql
-- Insert Diagnostic Centres
INSERT INTO public.diagnostic_centres (id, name, city, phone, address, rating) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Vijaya Diagnostics', 'Hyderabad', '+91 40 1234 5678', 'Road No. 36, Jubilee Hills', 4.9),
  ('22222222-2222-2222-2222-222222222222', 'Thyrocare', 'Mumbai', '+91 22 1234 5678', 'Andheri East', 4.7),
  ('33333333-3333-3333-3333-333333333333', 'Lucid Diagnostics', 'Bangalore', '+91 80 1234 5678', 'Koramangala', 4.8)
ON CONFLICT DO NOTHING;

-- Insert Tests
INSERT INTO public.tests (id, name, description, category, sample_type, tests_included, parameters, preparation_instructions) VALUES
  ('test-111111111111', 'Complete Blood Count (CBC)', 'Comprehensive blood analysis', 'blood', 'Blood', 28, '[\"Hemoglobin\", \"RBC\", \"WBC\", \"Platelets\"]', 'No preparation needed'),
  ('test-222222222222', 'HbA1c', '3-month blood sugar average', 'blood', 'Blood', 1, '[\"HbA1c\"]', 'No fasting'),
  ('test-333333333333', 'Thyroid Profile', 'T3, T4, TSH', 'blood', 'Blood', 3, '[\"T3\", \"T4\", \"TSH\"]', '8-12 hours fasting'),
  ('test-444444444444', 'Fasting Blood Sugar', 'Blood glucose test', 'blood', 'Blood', 1, '[\"Glucose\"]', '8-12 hours fasting'),
  ('test-555555555555', 'Lipid Profile', 'Cholesterol test', 'blood', 'Blood', 8, '[\"Cholesterol\", \"HDL\", \"LDL\"]', '12-14 hours fasting'),
  ('test-666666666666', 'Vitamin D', 'Vitamin D test', 'blood', 'Blood', 1, '[\"Vitamin D\"]', 'No preparation')
ON CONFLICT DO NOTHING;

-- Insert Scans
INSERT INTO public.scans (id, name, description, category, preparation_instructions) VALUES
  ('scan-111111111111', 'USG Abdomen', 'Ultrasound of abdominal organs', 'ultrasound', 'Empty stomach 6 hours'),
  ('scan-222222222222', 'CT Brain', 'CT scan of brain', 'ct', 'No preparation'),
  ('scan-333333333333', '2D ECHO', 'Heart ultrasound', 'ultrasound', 'No preparation'),
  ('scan-444444444444', 'ECG', 'Heart rhythm test', 'ecg', 'Wear loose clothing'),
  ('scan-555555555555', 'MRI Spine', 'MRI of spine', 'mri', 'Remove metal objects'),
  ('scan-666666666666', 'X-Ray Chest', 'Chest X-ray', 'xray', 'No preparation')
ON CONFLICT DO NOTHING;

-- Insert Packages
INSERT INTO public.packages (id, name, description, tests_included, included_tests, popular) VALUES
  ('pkg-111111111111', 'Diabetes Profile', 'Complete diabetes screening', 8, '[\"FBS\", \"HbA1c\", \"Lipid\"]', true),
  ('pkg-222222222222', 'Full Body Checkup', 'Comprehensive health package', 72, '[\"CBC\", \"Lipid\", \"Thyroid\"]', true),
  ('pkg-333333333333', 'Master Health Checkup', 'Premium health package', 110, '[\"All Tests\", \"ECG\", \"X-Ray\"]', true)
ON CONFLICT DO NOTHING;

-- Insert Centre Pricing for Tests
INSERT INTO public.centre_pricing (centre_id, item_type, item_id, price, original_price, discount, report_delivery_time, home_collection) VALUES
  ('11111111-1111-1111-1111-111111111111', 'test', 'test-111111111111', 350, 500, 30, '6 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'test', 'test-111111111111', 320, 450, 29, '12 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'test', 'test-111111111111', 380, 520, 27, '8 hours', true),
  ('11111111-1111-1111-1111-111111111111', 'test', 'test-222222222222', 480, 650, 26, '24 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'test', 'test-222222222222', 450, 600, 25, '12 hours', true),
  ('11111111-1111-1111-1111-111111111111', 'test', 'test-333333333333', 600, 850, 29, '24 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'test', 'test-333333333333', 550, 800, 31, '24 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'test', 'test-333333333333', 580, 850, 32, '18 hours', true),
  ('11111111-1111-1111-1111-111111111111', 'test', 'test-444444444444', 180, 250, 28, '6 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'test', 'test-444444444444', 200, 280, 29, '8 hours', true),
  ('11111111-1111-1111-1111-111111111111', 'test', 'test-555555555555', 450, 650, 31, '12 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'test', 'test-555555555555', 420, 600, 30, '12 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'test', 'test-666666666666', 800, 1100, 27, '48 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'test', 'test-666666666666', 850, 1200, 29, '48 hours', true)
ON CONFLICT DO NOTHING;

-- Insert Centre Pricing for Scans
INSERT INTO public.centre_pricing (centre_id, item_type, item_id, price, original_price, discount, report_delivery_time, home_collection) VALUES
  ('11111111-1111-1111-1111-111111111111', 'scan', 'scan-111111111111', 1200, 1500, 20, '24 hours', false),
  ('33333333-3333-3333-3333-333333333333', 'scan', 'scan-111111111111', 1350, 1600, 16, '24 hours', false),
  ('33333333-3333-3333-3333-333333333333', 'scan', 'scan-222222222222', 2800, 3500, 20, '24 hours', false),
  ('11111111-1111-1111-1111-111111111111', 'scan', 'scan-333333333333', 1500, 2000, 25, '6 hours', false),
  ('22222222-2222-2222-2222-222222222222', 'scan', 'scan-333333333333', 1600, 2100, 24, '12 hours', false),
  ('11111111-1111-1111-1111-111111111111', 'scan', 'scan-444444444444', 250, 350, 29, '2 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'scan', 'scan-444444444444', 280, 380, 26, '4 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'scan', 'scan-555555555555', 4500, 6000, 25, '48 hours', false),
  ('11111111-1111-1111-1111-111111111111', 'scan', 'scan-666666666666', 300, 400, 25, '2 hours', false),
  ('22222222-2222-2222-2222-222222222222', 'scan', 'scan-666666666666', 320, 420, 24, '4 hours', false)
ON CONFLICT DO NOTHING;

-- Insert Centre Pricing for Packages
INSERT INTO public.centre_pricing (centre_id, item_type, item_id, price, original_price, discount, report_delivery_time, home_collection) VALUES
  ('11111111-1111-1111-1111-111111111111', 'package', 'pkg-111111111111', 999, 1499, 33, '24 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'package', 'pkg-111111111111', 949, 1399, 32, '24 hours', true),
  ('11111111-1111-1111-1111-111111111111', 'package', 'pkg-222222222222', 2199, 4399, 50, '48 hours', true),
  ('22222222-2222-2222-2222-222222222222', 'package', 'pkg-222222222222', 1999, 3999, 50, '48 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'package', 'pkg-222222222222', 2299, 4599, 50, '36 hours', true),
  ('33333333-3333-3333-3333-333333333333', 'package', 'pkg-333333333333', 3999, 7999, 50, '72 hours', true)
ON CONFLICT DO NOTHING;
```

**✅ Data seeded!**

---

## STEP 3: Create Test Partner (2 minutes)

**A. Create User in Supabase:**
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - Email: `partner@lablink.com`
   - Password: `demo123`
   - **Turn ON**: "Auto Confirm User"
4. Click **Create User**
5. **COPY the UUID** from users table

**B. Link Partner Account:**

Go to SQL Editor → New Query → Paste (replace YOUR_UUID):

```sql
INSERT INTO public.partners (
  user_id, 
  full_name, 
  phone, 
  partner_type, 
  city, 
  state,
  commission_percentage
) VALUES (
  'YOUR_USER_UUID_HERE',
  'Dr. Rajesh Kumar',
  '+91 9876543210',
  'pharmacist',
  'Hyderabad',
  'Telangana',
  10.00
);
```

**✅ Partner account ready!**

---

## STEP 4: Enable Realtime (30 seconds)

1. Go to **Database** → **Replication**
2. Find these tables and click **Enable**:
   - ✅ `bookings`
   - ✅ `commissions`
3. Click **Save**

**✅ Real-time active!**

---

## STEP 5: Test the Integration! 🎉

1. **Restart the App:**
```bash
pkill -f "next dev"
cd /app/apps/web
PORT=3000 yarn dev
```

2. **Login:**
   - Go to http://localhost:3000/login
   - Email: partner@lablink.com
   - Password: demo123

3. **Browse Tests:**
   - Should now load from Supabase!
   - Check browser console: should see "Fetching from Supabase"

4. **Create a Booking:**
   - Add test to cart
   - Go through checkout
   - Confirm booking
   - Check Supabase → bookings table → New row! ✅

5. **Check Earnings:**
   - Go to "My Earnings"
   - Commission auto-calculated from database! 💰

6. **Test Real-Time:**
   - In Supabase, update commission status to 'approved'
   - Browser notification appears! 🔔

---

## 📊 Verification Checklist

After setup, verify in Supabase Dashboard:

**Table Editor:**
- [ ] diagnostic_centres: 3 rows
- [ ] tests: 6 rows
- [ ] scans: 6 rows
- [ ] packages: 3 rows
- [ ] centre_pricing: 24 rows
- [ ] partners: 1 row (your account)

**Authentication:**
- [ ] 1 user: partner@lablink.com

**Database → Replication:**
- [ ] bookings: Enabled
- [ ] commissions: Enabled

**SQL Editor Test:**
```sql
-- Should return data
SELECT * FROM public.tests;
SELECT * FROM public.centre_pricing;
SELECT * FROM public.partners;
```

---

## 🎯 What Works Now

✅ **Live Database:**
- Tests from Supabase
- Scans from Supabase
- Packages from Supabase
- Multi-centre pricing from DB

✅ **Bookings:**
- Saved to Supabase
- Commission auto-created
- Patient records created
- Real-time updates

✅ **Earnings:**
- Fetched from commissions table
- Auto-calculated on booking
- Status tracking (pending/approved/paid)

✅ **Real-Time:**
- Browser notifications
- Live data updates
- No refresh needed

✅ **Security:**
- RLS protecting data
- Partners see only their data
- Auth required for sensitive operations

---

## 🚨 Troubleshooting

**"No data showing"**
- Check browser console for errors
- Verify tables exist in Supabase
- App falls back to mock data automatically

**"Login fails"**
- Verify user created in Authentication
- Check partner record exists
- Email must match exactly

**"No notifications"**
- Allow browser permissions
- Enable Realtime replication
- Check console for subscription logs

---

## ✅ Done!

Your Lab Link platform is now **fully integrated with Supabase!**

**3 simple SQL copy-pastes and you're live!** 🚀
