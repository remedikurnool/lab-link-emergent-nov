# Admin Login Credentials

## Current Admin User

**Email:** `admin@lablink.com`  
**Password:** `admin@123`  
**User ID:** `341cad1d-1d9c-4e36-b197-3050eb793c08`  
**Role:** `super_admin`  
**Status:** `active`

## Login Instructions

1. **Start the admin dev server:**
   ```bash
   cd apps/admin
   pnpm dev
   ```

2. **Navigate to login page:**
   ```
   http://localhost:3201/login
   ```

3. **Enter credentials:**
   - Email: `admin@lablink.com`
   - Password: `admin@123`

4. **After successful login:**
   - You'll be redirected to the dashboard
   - You'll have full admin access

## Verification

The admin user has been verified in the database:
- ✅ User exists in `auth.users`
- ✅ Email is confirmed
- ✅ User exists in `admin_users` table
- ✅ Role is `super_admin`
- ✅ Status is `active`
- ✅ RLS policies are configured correctly

## Troubleshooting

If login doesn't work:

1. **Clear browser storage:**
   - Open DevTools (F12)
   - Application → Clear Storage → Clear site data
   - Or use incognito/private mode

2. **Check environment variables:**
   - Verify `apps/admin/.env.local` exists
   - Should contain:
     ```env
     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     ```

3. **Check browser console:**
   - Open DevTools (F12) → Console
   - Look for any error messages

4. **Verify Supabase connection:**
   - Check network tab for failed requests
   - Verify Supabase URL and key are correct

## Security Note

⚠️ **Change the password after first login** for security purposes.

You can reset the password via:
- Supabase Dashboard → Authentication → Users → Reset Password
- Or update it programmatically

