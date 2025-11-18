# 🚀 Lab Link - Complete Supabase Integration Guide

## Overview

Lab Link now has **complete Supabase integration** with:
- ✅ Database schema with RLS policies
- ✅ Real-time subscriptions for live updates
- ✅ Automatic commission calculation
- ✅ Secure authentication
- ✅ Fallback to mock data (graceful degradation)

---

## Quick Start

### Option 1: Use Mock Data (No Setup Required)
The app works out-of-the-box with mock data. Just browse and test features!

### Option 2: Full Supabase Integration (Recommended for Production)

Follow these steps to enable live database integration:

---

## 🔧 Step-by-Step Supabase Setup

### Step 1: Access Supabase Dashboard

1. Go to: https://app.supabase.com
2. Login and select project: `aqoyqjgngvtdxgqbdtcw`

### Step 2: Create Database Schema

1. Click **SQL Editor** in left sidebar
2. Click **New Query**
3. Copy contents of `/app/supabase/migrations/001_initial_schema.sql`
4. Paste into SQL editor
5. Click **Run** button

**What this creates:**
- 9 tables (centres, tests, scans, packages, partners, patients, bookings, commissions, payouts, centre_pricing)
- Indexes for performance
- RLS policies for security

### Step 3: Seed Sample Data

1. Click **New Query** in SQL Editor
2. Copy contents of `/app/supabase/migrations/002_seed_data.sql`
3. Paste and click **Run**

**What this inserts:**
- 3 diagnostic centres (Vijaya, Thyrocare, Lucid)
- 6 lab tests (CBC, HbA1c, Thyroid, FBS, Lipid, Vitamin D)
- 6 scans (USG, CT, ECHO, ECG, MRI, X-Ray)
- 3 packages (Diabetes, Full Body, Master)
- 24 centre pricing entries (multi-centre pricing)

### Step 4: Create Test Partner Account

1. Go to **Authentication** > **Users**
2. Click **Add User** > **Create new user**
3. Enter:
   ```
   Email: partner@lablink.com
   Password: demo123
   Auto Confirm User: ON
   ```
4. Click **Create User**
5. Copy the user's UUID from the users table

6. Go back to **SQL Editor** and run:
```sql
INSERT INTO public.partners (
  user_id, 
  full_name, 
  phone, 
  partner_type, 
  city, 
  state, 
  commission_percentage
)
VALUES (
  'PASTE_USER_UUID_HERE', 
  'Dr. Rajesh Kumar', 
  '+91 9876543210', 
  'pharmacist', 
  'Hyderabad', 
  'Telangana', 
  10.00
);
```

### Step 5: Enable Realtime

1. Go to **Database** > **Replication**
2. Find and enable replication for:
   - ✅ `bookings` table
   - ✅ `commissions` table
   - ✅ `payouts` table
3. Click **Save**

### Step 6: Verify Setup

Run these verification queries in SQL Editor:

```sql
-- Check centres (should show 3)
SELECT * FROM public.diagnostic_centres;

-- Check tests (should show 6)
SELECT * FROM public.tests;

-- Check pricing (should show 24+ entries)
SELECT COUNT(*) FROM public.centre_pricing;

-- Check partner account
SELECT * FROM public.partners;

-- Verify RLS policies
SELECT tablename, policyname FROM pg_policies 
WHERE schemaname = 'public';
```

### Step 7: Test Login

1. Go to http://localhost:3200/login
2. Login with:
   ```
   Email: partner@lablink.com
   Password: demo123
   ```
3. You should be redirected to home page

### Step 8: Test Complete Flow

1. Browse tests → Add to cart
2. Go to checkout
3. Fill patient details
4. Select collection details
5. Confirm booking
6. Check "My Bookings" - should show in Supabase!
7. Check "My Earnings" - commission calculated!

---

## 🔐 Security Features

### Row Level Security (RLS) Enabled

**Public Access:**
- ✅ Anyone can read active tests/scans/packages/centres

**Partner Access:**
- ✅ Can only read/update their own profile
- ✅ Can only see their own patients
- ✅ Can only see their own bookings
- ✅ Can only see their own commissions/payouts

**Admin Access:**
- Use Supabase service role key (not exposed to frontend)

---

## 🔄 Real-Time Features

### What Updates in Real-Time:

1. **New Bookings:**
   - When partner creates booking
   - Appears instantly in "My Bookings"
   
2. **Commission Updates:**
   - Automatically created on booking
   - Status changes (pending → approved → paid)
   - Browser notifications enabled
   
3. **Payout Updates:**
   - When admin processes payouts
   - Instant notification to partner

### Browser Notifications

The app requests notification permission and shows:
- 🔔 "New Commission Earned!"
- 🔔 "Commission Approved!"
- 🔔 "Commission Paid!"

---

## 📊 Database Schema Details

### Tables Created:

1. **diagnostic_centres** - Lab/scan centres
2. **tests** - Lab tests catalogue
3. **scans** - Medical scans catalogue
4. **packages** - Health packages
5. **centre_pricing** - Multi-centre pricing (key table!)
6. **partners** - Healthcare partners
7. **patients** - Patient records
8. **bookings** - All bookings
9. **commissions** - Partner commissions
10. **payouts** - Payout records

### Key Relationships:

```
partners → bookings → commissions → payouts
         → patients

tests/scans/packages → centre_pricing ← diagnostic_centres
```

---

## 🎯 How It Works

### With Supabase Connected:
1. App fetches real data from Supabase
2. Multi-centre pricing from `centre_pricing` table
3. Bookings saved to database
4. Commissions auto-calculated and stored
5. Real-time updates via Realtime subscriptions
6. Browser notifications for important events

### Without Supabase (Fallback):
1. App uses mock data automatically
2. Bookings saved to localStorage
3. Commissions calculated client-side
4. Everything still works perfectly!

---

## 🛠️ Troubleshooting

### "Missing Supabase environment variables"
- Ensure `/app/apps/web/.env.local` exists with credentials
- Restart Next.js dev server

### Tables not found
- Run the schema migration SQL first
- Check Supabase dashboard > Table Editor

### Login fails
- Verify user created in Supabase Auth
- Check partner record exists with correct user_id
- Verify email/password

### No real-time updates
- Enable replication in Database > Replication
- Check browser console for subscription logs

---

## 📝 SQL Files Location

- **Schema:** `/app/supabase/migrations/001_initial_schema.sql`
- **Seed Data:** `/app/supabase/migrations/002_seed_data.sql`
- **Instructions:** `/app/supabase/SETUP_INSTRUCTIONS.md`

---

## ✅ Verification Checklist

After setup, verify:
- [ ] Can login with test account
- [ ] Tests/scans/packages load from Supabase
- [ ] Can add items to cart
- [ ] Can create booking
- [ ] Booking appears in "My Bookings"
- [ ] Commission shows in "My Earnings"
- [ ] Profile page loads partner data
- [ ] Real-time updates work (test by updating booking in Supabase)

---

## 🎉 You're Done!

Your Lab Link platform is now fully integrated with Supabase!

**Features Active:**
- ✅ Live database
- ✅ Real-time updates
- ✅ Secure authentication
- ✅ RLS policies protecting data
- ✅ Commission auto-calculation
- ✅ Browser notifications

**The platform is production-ready with live backend!** 🚀
