# Debug Admin Login Issues

## Current Setup

- **Email:** `admin@lablink.com`
- **User ID:** `341cad1d-1d9c-4e36-b197-3050eb793c08`
- **Password:** `admin@123`
- **Role:** `super_admin`
- **Status:** `active`

## Debugging Steps

### 1. Check Browser Console

Open DevTools (F12) → Console tab and look for:
- `Attempting sign in for: admin@lablink.com`
- `Sign in successful, checking admin status...`
- `Admin check result:` (should show adminData)
- `Direct admin check:` (should show adminCheck)
- Any error messages

### 2. Check Network Tab

Open DevTools (F12) → Network tab:
- Look for requests to Supabase
- Check if they're successful (200 status)
- Look for failed requests (red)
- Check the response data

### 3. Verify Environment Variables

Check if `apps/admin/.env.local` exists:
```bash
cat apps/admin/.env.local
```

Should contain:
```env
NEXT_PUBLIC_SUPABASE_URL=https://aqoyqjgngvtdxgqbdtcw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Test Supabase Connection

In browser console (on login page):
```javascript
// Check Supabase client
import { supabase } from '@/lib/supabase';
console.log('Supabase URL:', supabase.supabaseUrl);

// Try manual query (after login)
const { data, error } = await supabase
  .from('admin_users')
  .select('*')
  .eq('user_id', '341cad1d-1d9c-4e36-b197-3050eb793c08')
  .maybeSingle();
console.log('Manual query result:', { data, error });
```

### 5. Check Session

After attempting login, check session:
```javascript
const { data: { session }, error } = await supabase.auth.getSession();
console.log('Current session:', { session, error });
```

### 6. Common Issues

#### Issue: "You do not have admin access"
**Possible causes:**
1. RLS policy blocking the query
2. Session not established when checking admin status
3. User not in admin_users table
4. User's is_active is false

**Check:**
```sql
SELECT * FROM admin_users WHERE user_id = '341cad1d-1d9c-4e36-b197-3050eb793c08';
```

#### Issue: RLS Policy Error (42501)
**Solution:** The policy should allow users to check their own status. Verify:
```sql
SELECT policyname, qual 
FROM pg_policies 
WHERE tablename = 'admin_users' 
AND policyname = 'Users can check own admin status';
```

Should show: `user_id = auth.uid()`

#### Issue: Session Not Established
**Solution:** The code now waits for session and retries. Check console logs for:
- "No valid session" messages
- Retry attempts

### 7. Force Refresh

1. Clear all browser storage
2. Restart dev server
3. Try login again
4. Check console for detailed logs

## What Was Fixed

1. ✅ Added retry logic for admin status check
2. ✅ Added session verification before checking admin status
3. ✅ Added detailed console logging
4. ✅ Improved Supabase client configuration with proper auth settings
5. ✅ Fixed RLS policies to allow users to check own status
6. ✅ Added delays to ensure session is established

## Next Steps

1. Try logging in again
2. Check browser console for detailed logs
3. Share any error messages you see
4. Check network tab for failed requests

