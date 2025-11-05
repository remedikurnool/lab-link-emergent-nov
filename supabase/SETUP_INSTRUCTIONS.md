# Supabase Database Setup Instructions

## Step 1: Run the Schema Migration

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project: `aqoyqjgngvtdxgqbdtcw`
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste the contents of `/app/supabase/migrations/001_initial_schema.sql`
6. Click **Run** to execute

This will create:
- All tables (diagnostic_centres, tests, scans, packages, partners, patients, bookings, commissions, payouts, centre_pricing)
- Indexes for performance
- RLS policies for security

## Step 2: Seed the Database

1. In SQL Editor, click **New Query**
2. Copy and paste the contents of `/app/supabase/migrations/002_seed_data.sql`
3. Click **Run** to execute

This will insert:
- 3 Diagnostic Centres (Vijaya, Thyrocare, Lucid)
- 6 Lab Tests (CBC, HbA1c, Thyroid, FBS, Lipid, Vitamin D)
- 6 Medical Scans (USG, CT, ECHO, ECG, MRI, X-Ray)
- 3 Health Packages (Diabetes, Full Body, Master)
- Multi-centre pricing for all items

## Step 3: Create a Test Partner Account

1. Go to **Authentication** > **Users**
2. Click **Add User**
3. Add user:
   - Email: partner@lablink.com
   - Password: demo123
   - Email Confirm: ON
4. Click **Create User**

5. Get the user's UUID from the users table

6. In SQL Editor, run:
```sql
INSERT INTO public.partners (user_id, full_name, phone, partner_type, city, state, commission_percentage)
VALUES 
  ('YOUR_USER_UUID_HERE', 'Dr. Rajesh Kumar', '+91 9876543210', 'pharmacist', 'Hyderabad', 'Telangana', 10.00);
```

## Step 4: Verify Database Setup

Run these queries to verify:

```sql
-- Check centres
SELECT * FROM public.diagnostic_centres;

-- Check tests
SELECT * FROM public.tests;

-- Check centre pricing
SELECT * FROM public.centre_pricing;

-- Check RLS policies
SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
```

## Step 5: Enable Realtime

1. Go to **Database** > **Replication**
2. Enable replication for these tables:
   - `bookings`
   - `commissions`
   - `payouts`

## Database Schema Overview

```
diagnostic_centres (3 rows)
  ├─ id, name, city, phone, address, rating
  
tests (6 rows)
  ├─ id, name, description, category, sample_type
  ├─ tests_included, parameters, preparation_instructions
  
scans (6 rows)
  ├─ id, name, description, category, preparation_instructions
  
packages (3 rows)
  ├─ id, name, description, tests_included, included_tests, popular
  
centre_pricing (24 rows)
  ├─ centre_id, item_type, item_id, price, original_price
  ├─ discount, report_delivery_time, home_collection
  
partners
  ├─ id, user_id, full_name, phone, partner_type
  ├─ address, city, state, bank details, commission_percentage
  
patients
  ├─ id, partner_id, full_name, age, gender, phone
  
bookings
  ├─ id, partner_id, patient_id, items (JSONB)
  ├─ total_amount, partner_commission, collection details
  ├─ payment_method, status
  
commissions
  ├─ id, partner_id, booking_id, amount, status
  
payouts
  ├─ id, partner_id, amount, commission_ids, status
```

## RLS Policies Applied

✅ Public can read active tests/scans/packages/centres  
✅ Partners can only read/update their own data  
✅ Partners can only see their own patients  
✅ Partners can only see their own bookings  
✅ Partners can only see their own commissions  
✅ Admin access via service role key (not exposed to frontend)  

## Next Steps

After running these migrations:
1. The app will automatically fetch data from Supabase
2. Login with partner@lablink.com / demo123
3. All features will work with live data
4. Real-time updates will work for bookings & commissions
