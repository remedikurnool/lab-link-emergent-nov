# Supabase Storage Setup

## Step 1: Create Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Click **New Bucket**

### Bucket 1: Prescriptions
- Name: `prescriptions`
- Public: `false` (private)
- File size limit: 5MB
- Allowed MIME types: `image/*,application/pdf`

### Bucket 2: Reports
- Name: `reports`
- Public: `false` (private)
- File size limit: 10MB
- Allowed MIME types: `application/pdf,image/*`

## Step 2: Set Bucket Policies

### For Prescriptions Bucket:
```sql
-- Partners can upload prescriptions
CREATE POLICY "Partners upload prescriptions"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'prescriptions' AND
  auth.uid() IS NOT NULL
);

-- Partners can read their own prescriptions
CREATE POLICY "Partners read own prescriptions"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'prescriptions' AND
  auth.uid() IS NOT NULL
);
```

### For Reports Bucket:
```sql
-- Admin can upload reports (check in application)
CREATE POLICY "Authenticated upload reports"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'reports' AND
  auth.uid() IS NOT NULL
);

-- Partners can read reports for their bookings
CREATE POLICY "Partners read reports"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'reports' AND
  auth.uid() IS NOT NULL
);
```

## Step 3: Run Settings Migration

Go to SQL Editor and run:
```sql
-- Copy from 003_storage_and_settings.sql
```

This creates the settings table for admin-configurable integrations.
