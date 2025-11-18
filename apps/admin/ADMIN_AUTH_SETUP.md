# Admin Authentication Setup Guide

## Overview
The admin panel now has full authentication and authorization implemented using Supabase Auth with role-based access control (RBAC).

## Features Implemented

### 1. Authentication
- ✅ Admin login page (`/login`)
- ✅ Session management
- ✅ Automatic redirect for unauthenticated users
- ✅ Logout functionality

### 2. Authorization
- ✅ Role-based access control (admin, super_admin)
- ✅ Protected routes for all admin pages
- ✅ Admin user management table

### 3. Components
- ✅ `useAuth` hook for authentication state
- ✅ `ProtectedRoute` component for route protection
- ✅ `AdminLayout` component with shared header and navigation
- ✅ Login page with error handling

## Setup Instructions

### Step 1: Create Admin User in Supabase

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter admin email and password
5. Set user metadata:
   ```json
   {
     "role": "admin"
   }
   ```
6. Click **Create User**

#### Option B: Using SQL (Recommended)
Run this SQL in Supabase SQL Editor:

```sql
-- First, create the user in auth.users (you'll need to do this via Supabase Auth API or Dashboard)
-- Then, insert into admin_users table:

INSERT INTO admin_users (user_id, email, role, is_active)
VALUES (
  'YOUR_USER_ID_FROM_AUTH_USERS',  -- Replace with actual user ID
  'admin@lablink.com',              -- Replace with admin email
  'admin',                          -- or 'super_admin' for super admin
  true
);
```

#### Option C: Using Supabase MCP Tool
```bash
# Create admin user via Supabase CLI or API
# Then insert into admin_users table using the migration
```

### Step 2: Apply Database Migration

The migration `013_create_admin_users.sql` creates:
- `admin_users` table
- RLS policies
- Indexes for performance
- Triggers for `updated_at`

Apply it using:
```bash
# If using Supabase CLI
supabase db push

# Or apply directly via Supabase Dashboard SQL Editor
```

### Step 3: Configure Environment Variables

Ensure your `apps/admin/.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Step 4: Test Login

1. Start the admin dev server:
   ```bash
   cd apps/admin
   pnpm dev
   ```

2. Navigate to `http://localhost:3201/login`
3. Enter admin credentials
4. You should be redirected to the dashboard

## User Roles

### Admin
- Can access all admin pages
- Can manage bookings, partners, commissions, centres
- Can configure settings
- Cannot manage other admin users

### Super Admin
- All Admin permissions
- Can create, update, and delete admin users
- Full system access

## Protected Routes

All admin routes are now protected:
- `/` (Dashboard)
- `/partners`
- `/bookings`
- `/commissions`
- `/centres`
- `/settings`

Unauthenticated users are automatically redirected to `/login`.

## Creating Additional Admin Users

### Via Supabase Dashboard
1. Create user in Authentication → Users
2. Set user metadata: `{ "role": "admin" }`
3. Insert into `admin_users` table:
   ```sql
   INSERT INTO admin_users (user_id, email, role, is_active)
   VALUES (
     'user_id_from_auth',
     'newadmin@lablink.com',
     'admin',
     true
   );
   ```

### Via SQL
```sql
-- Get user_id from auth.users first
SELECT id, email FROM auth.users WHERE email = 'newadmin@lablink.com';

-- Then insert into admin_users
INSERT INTO admin_users (user_id, email, role, is_active)
VALUES (
  'user_id_from_above_query',
  'newadmin@lablink.com',
  'admin',
  true
);
```

## Security Notes

1. **RLS Policies**: The `admin_users` table has Row Level Security enabled. Only admins can view it, and only super_admins can modify it.

2. **Session Management**: Sessions are managed by Supabase Auth. Tokens are stored securely.

3. **Route Protection**: All admin routes check authentication and authorization before rendering.

4. **Role Checking**: The `useAuth` hook checks both:
   - User metadata (`user_metadata.role`)
   - `admin_users` table entry

5. **Automatic Sign-out**: Non-admin users are automatically signed out if they somehow access the admin panel.

## Troubleshooting

### "Unauthorized" Error
- Check that user exists in `admin_users` table
- Verify `is_active = true`
- Check user metadata has `role: 'admin'` or `role: 'super_admin'`

### Login Not Working
- Verify Supabase environment variables are set
- Check browser console for errors
- Verify user exists in `auth.users`
- Check that user has entry in `admin_users` table

### Redirect Loop
- Clear browser cookies/localStorage
- Check that login page is not protected (it should be public)
- Verify `ProtectedRoute` is not wrapping login page

## Next Steps

1. **Create First Admin User**: Follow Step 1 above
2. **Test Authentication**: Login and verify access
3. **Create Additional Admins**: As needed
4. **Configure Roles**: Assign super_admin role to trusted users only

## Files Modified

- `apps/admin/src/hooks/use-auth.ts` - Authentication hook
- `apps/admin/src/components/auth/ProtectedRoute.tsx` - Route protection
- `apps/admin/src/components/layout/AdminLayout.tsx` - Shared layout
- `apps/admin/src/app/login/page.tsx` - Login page
- All admin pages wrapped with `AdminLayout`/`ProtectedRoute`

## Migration

- `supabase/migrations/013_create_admin_users.sql` - Admin users table and policies

