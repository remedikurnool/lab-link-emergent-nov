# Admin Login Troubleshooting Guide

## Common Issues and Fixes

### Issue 1: "Invalid email or password"

**Possible Causes:**
- Wrong email or password
- User doesn't exist in Supabase Auth
- Email not confirmed

**Solutions:**
1. Verify user exists:
   ```sql
   SELECT id, email, email_confirmed_at 
   FROM auth.users 
   WHERE email = 'admin@lablink.com';
   ```

2. Reset password in Supabase Dashboard:
   - Go to Authentication → Users
   - Find the user
   - Click "Reset Password"

3. Verify email is confirmed (should have `email_confirmed_at` value)

### Issue 2: "You do not have admin access"

**Possible Causes:**
- User not in `admin_users` table
- User's `is_active` is `false`
- User's role is incorrect

**Solutions:**
1. Check admin_users table:
   ```sql
   SELECT * FROM admin_users WHERE email = 'admin@lablink.com';
   ```

2. If missing, add the user:
   ```sql
   INSERT INTO admin_users (user_id, email, role, is_active)
   VALUES (
     'user_id_from_auth',
     'admin@lablink.com',
     'super_admin',
     true
   );
   ```

3. If inactive, activate:
   ```sql
   UPDATE admin_users 
   SET is_active = true 
   WHERE email = 'admin@lablink.com';
   ```

### Issue 3: Login succeeds but redirects back to login

**Possible Causes:**
- RLS policy blocking admin check
- Session not persisting
- State not updating correctly

**Solutions:**
1. Clear browser storage:
   - Open DevTools (F12)
   - Application tab → Clear Storage → Clear site data

2. Check browser console for errors

3. Verify RLS policies:
   ```sql
   SELECT policyname, cmd, qual 
   FROM pg_policies 
   WHERE tablename = 'admin_users';
   ```

4. Restart dev server

### Issue 4: "Network error" or "Failed to fetch"

**Possible Causes:**
- Supabase environment variables not set
- Wrong Supabase URL or key
- Network connectivity issues

**Solutions:**
1. Check `.env.local` file exists in `apps/admin/`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Verify values in Supabase Dashboard:
   - Settings → API
   - Copy Project URL and anon/public key

3. Restart dev server after changing env vars

### Issue 5: Infinite loading on login page

**Possible Causes:**
- `useAuth` hook stuck in loading state
- Session check failing
- Component re-render loop

**Solutions:**
1. Check browser console for errors
2. Clear browser cache and cookies
3. Check network tab for failed requests
4. Verify Supabase client is initialized correctly

## Debug Steps

### Step 1: Check Browser Console
Open DevTools (F12) → Console tab and look for:
- Authentication errors
- Network errors
- JavaScript errors

### Step 2: Check Network Requests
Open DevTools → Network tab:
- Look for requests to Supabase
- Check if they're failing (red)
- Check response status codes

### Step 3: Verify Database
```sql
-- Check user exists
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'admin@lablink.com';

-- Check admin entry
SELECT * FROM admin_users 
WHERE email = 'admin@lablink.com';

-- Check RLS policies
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'admin_users';
```

### Step 4: Test Supabase Connection
In browser console (on login page):
```javascript
// Check if Supabase is configured
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);

// Try manual sign in (for testing)
import { supabase } from '@/lib/supabase';
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'admin@lablink.com',
  password: 'your-password'
});
console.log('Sign in result:', { data, error });
```

## Quick Fixes

### Reset Everything
1. Clear browser storage (cookies, localStorage, sessionStorage)
2. Restart dev server
3. Try login again

### Recreate Admin User
```sql
-- Get user ID
SELECT id, email FROM auth.users WHERE email = 'admin@lablink.com';

-- Delete old admin entry (if exists)
DELETE FROM admin_users WHERE email = 'admin@lablink.com';

-- Create new admin entry
INSERT INTO admin_users (user_id, email, role, is_active)
VALUES (
  'user_id_from_above',
  'admin@lablink.com',
  'super_admin',
  true
);
```

### Check Environment Variables
```bash
# In apps/admin directory
cat .env.local

# Should contain:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## Still Not Working?

1. **Check Supabase Logs:**
   - Go to Supabase Dashboard
   - Logs → API or Auth
   - Look for errors related to your login attempts

2. **Verify RLS Policies:**
   - The policy should allow users to check their own status
   - Policy: "Users can check own admin status"

3. **Test with Different Browser:**
   - Try incognito/private mode
   - Try different browser

4. **Check for CORS Issues:**
   - Verify Supabase URL is correct
   - Check if there are CORS errors in console

## Contact Support

If none of the above works:
1. Collect error messages from browser console
2. Check Supabase logs for errors
3. Verify all environment variables are set
4. Document the exact steps to reproduce the issue

