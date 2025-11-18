# Create First Admin User

## Overview

This guide will help you create your first admin user for the Lab Link admin panel. The admin authentication system uses Supabase Auth with role-based access control.

## Prerequisites

- ✅ Supabase project configured
- ✅ `admin_users` table created (migration `013_create_admin_users.sql` applied)
- ✅ Admin panel code deployed

## Quick Start (Using Supabase MCP Tool)

If you have access to the Supabase MCP tool, you can create an admin user directly:

### Step 1: Check Existing Users

First, check if you have any existing users in Supabase Auth:

```sql
SELECT id, email, created_at, email_confirmed_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### Step 2: Create Admin User Entry

If a user exists, add them to the `admin_users` table:

```sql
INSERT INTO admin_users (user_id, email, role, is_active)
VALUES (
  'YOUR_USER_ID_HERE',  -- From Step 1
  'admin@lablink.com',   -- User's email
  'super_admin',         -- Start with super_admin for first user
  true
)
ON CONFLICT (user_id) DO UPDATE
SET 
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW()
RETURNING *;
```

### Step 3: Verify Admin User

Verify the admin user was created successfully:

```sql
SELECT 
  au.id,
  au.email,
  au.role,
  au.is_active,
  au.created_at,
  u.email as auth_email,
  u.email_confirmed_at
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id;
```

---

## Manual Setup (Via Supabase Dashboard)

If you prefer to use the Supabase Dashboard, follow these steps:

### Step 1: Create User in Supabase Auth

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter the following:
   - **Email**: `admin@lablink.com` (or your preferred admin email)
   - **Password**: Choose a strong password (save this securely!)
   - **Auto Confirm User**: ✅ Check this box
5. Click **Create User**
6. **Important**: Copy the **User ID** from the user list (you'll need this in Step 2)

### Step 2: Get User ID

If you didn't copy the User ID, you can retrieve it:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query:

```sql
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'admin@lablink.com'
ORDER BY created_at DESC 
LIMIT 1;
```

3. Copy the `id` value from the results

### Step 3: Add User to admin_users Table

1. In **SQL Editor**, run this query (replace the values):

```sql
INSERT INTO admin_users (user_id, email, role, is_active)
VALUES (
  'YOUR_USER_ID_HERE',  -- Paste the User ID from Step 2
  'admin@lablink.com',   -- The email you used in Step 1
  'super_admin',         -- Start with super_admin for first user
  true
);
```

**Example:**
```sql
INSERT INTO admin_users (user_id, email, role, is_active)
VALUES (
  '13c98a41-6667-4837-a7dd-1f7d54eea318',
  'admin@lablink.com',
  'super_admin',
  true
);
```

### Step 4: Verify Admin User

Verify the admin user was created:

```sql
SELECT 
  au.id,
  au.email,
  au.role,
  au.is_active,
  au.created_at,
  u.email as auth_email
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id
WHERE au.email = 'admin@lablink.com';
```

You should see:
- ✅ `role`: `super_admin`
- ✅ `is_active`: `true`
- ✅ `auth_email`: matches your email

---

## Test Login

### Step 1: Start Admin Dev Server

```bash
cd apps/admin
pnpm dev
```

The admin panel will start at: `http://localhost:3201`

### Step 2: Navigate to Login Page

Open your browser and go to:
```
http://localhost:3201/login
```

### Step 3: Login

Enter your credentials:
- **Email**: `admin@lablink.com` (or the email you used)
- **Password**: The password you set when creating the user

### Step 4: Verify Access

After successful login, you should:
- ✅ Be redirected to the dashboard (`/`)
- ✅ See the admin header with navigation
- ✅ See your email displayed in the header
- ✅ Have access to all admin pages

---

## Creating Additional Admin Users

### Regular Admin (Limited Permissions)

Regular admins can access all admin pages but cannot manage other admin users:

```sql
-- First, create the user in Supabase Auth Dashboard
-- Then add to admin_users table:

INSERT INTO admin_users (user_id, email, role, is_active)
VALUES (
  'user_id_from_auth',  -- Get from auth.users table
  'newadmin@lablink.com',
  'admin',  -- Regular admin role
  true
);
```

### Super Admin (Full Permissions)

Super admins can manage other admin users:

```sql
INSERT INTO admin_users (user_id, email, role, is_active)
VALUES (
  'user_id_from_auth',
  'superadmin@lablink.com',
  'super_admin',  -- Full permissions
  true
);
```

### Bulk Create Multiple Admins

```sql
-- Create multiple admin users at once
INSERT INTO admin_users (user_id, email, role, is_active)
VALUES 
  ('user_id_1', 'admin1@lablink.com', 'admin', true),
  ('user_id_2', 'admin2@lablink.com', 'admin', true),
  ('user_id_3', 'superadmin@lablink.com', 'super_admin', true);
```

---

## User Roles Explained

### Admin (`admin`)
- ✅ Access to all admin pages
- ✅ Can manage bookings, partners, commissions, centres
- ✅ Can configure settings
- ❌ Cannot manage other admin users
- ❌ Cannot view/modify `admin_users` table

### Super Admin (`super_admin`)
- ✅ All Admin permissions
- ✅ Can create, update, and delete admin users
- ✅ Can view and manage `admin_users` table
- ✅ Full system access

---

## Troubleshooting

### "Unauthorized" Error After Login

**Possible causes:**
1. User doesn't exist in `admin_users` table
2. User's `is_active` is `false`
3. User's `role` is not 'admin' or 'super_admin'

**Solution:**
```sql
-- Check user status
SELECT * FROM admin_users WHERE email = 'your-email@lablink.com';

-- If missing, add the user
-- If inactive, activate:
UPDATE admin_users 
SET is_active = true 
WHERE email = 'your-email@lablink.com';

-- If wrong role, update:
UPDATE admin_users 
SET role = 'admin' 
WHERE email = 'your-email@lablink.com';
```

### Can't See admin_users Table

**Cause:** RLS policies require you to be an admin to view the table.

**Solution:**
- Make sure you're logged in as an admin user
- Verify your user has `is_active = true` in `admin_users` table
- Check that your session is valid

### Login Not Working

**Checklist:**
1. ✅ Verify Supabase environment variables in `apps/admin/.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. ✅ Check browser console for errors (F12 → Console)

3. ✅ Verify user exists in `auth.users`:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your-email@lablink.com';
   ```

4. ✅ Verify user has entry in `admin_users`:
   ```sql
   SELECT * FROM admin_users WHERE email = 'your-email@lablink.com';
   ```

5. ✅ Check that user's email is confirmed:
   ```sql
   SELECT email, email_confirmed_at FROM auth.users WHERE email = 'your-email@lablink.com';
   ```

### Redirect Loop

**Cause:** Login page might be protected or session issue.

**Solution:**
1. Clear browser cookies/localStorage for localhost:3201
2. Verify login page is accessible (should not be protected)
3. Check that `ProtectedRoute` is not wrapping the login page
4. Restart the dev server

### "User not found" Error

**Cause:** User exists in `auth.users` but not in `admin_users`.

**Solution:**
```sql
-- Find the user_id
SELECT id, email FROM auth.users WHERE email = 'your-email@lablink.com';

-- Add to admin_users (replace with actual user_id)
INSERT INTO admin_users (user_id, email, role, is_active)
VALUES (
  'user_id_from_above',
  'your-email@lablink.com',
  'admin',
  true
);
```

---

## Security Best Practices

### Password Security
- ✅ Use strong passwords (minimum 12 characters)
- ✅ Include uppercase, lowercase, numbers, and symbols
- ✅ Don't share admin passwords
- ✅ Use a password manager

### User Management
- ✅ Create first user as `super_admin`
- ✅ Limit `super_admin` roles to trusted personnel only
- ✅ Regularly review admin users and deactivate unused accounts
- ✅ Use `is_active = false` to temporarily disable access instead of deleting

### Access Control
- ✅ RLS policies protect the `admin_users` table
- ✅ Only active admins can view the table
- ✅ Only super_admins can modify admin users
- ✅ Sessions are managed securely by Supabase Auth

### Monitoring
- ✅ Regularly audit admin user access
- ✅ Check `audit_logs` table for admin actions
- ✅ Monitor failed login attempts

---

## Quick Reference Commands

### List All Admin Users
```sql
SELECT 
  au.email,
  au.role,
  au.is_active,
  au.created_at,
  u.email_confirmed_at
FROM admin_users au
JOIN auth.users u ON u.id = au.user_id
ORDER BY au.created_at DESC;
```

### Deactivate an Admin User
```sql
UPDATE admin_users 
SET is_active = false, updated_at = NOW()
WHERE email = 'admin@lablink.com';
```

### Reactivate an Admin User
```sql
UPDATE admin_users 
SET is_active = true, updated_at = NOW()
WHERE email = 'admin@lablink.com';
```

### Change Admin Role
```sql
UPDATE admin_users 
SET role = 'super_admin', updated_at = NOW()
WHERE email = 'admin@lablink.com';
```

### Delete an Admin User (Super Admin Only)
```sql
DELETE FROM admin_users 
WHERE email = 'admin@lablink.com';
```

---

## Next Steps

After creating your first admin:

1. ✅ **Test Login** - Verify you can access the admin panel
2. ✅ **Explore Dashboard** - Check all admin pages are accessible
3. ✅ **Configure Settings** - Set up payment gateways, notifications, etc.
4. ✅ **Create Additional Admins** - Add team members as needed
5. ✅ **Review Security** - Ensure RLS policies are working correctly

---

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review browser console for errors
3. Check Supabase logs for database errors
4. Verify environment variables are set correctly
5. Ensure all migrations have been applied

For more information, see `ADMIN_AUTH_SETUP.md`.
