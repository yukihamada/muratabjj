# Supabase Authentication Setup Guide

## Prerequisites
- Supabase project created at https://supabase.com
- Environment variables configured in `.env.local`

## Steps to Fix Authentication

### 1. Configure Redirect URLs in Supabase Dashboard

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project (vyddhllzjjpqxbouqivf)
3. Navigate to Authentication → URL Configuration
4. Add the following URLs to "Redirect URLs":
   ```
   http://localhost:3000/auth/callback
   http://localhost:3001/auth/callback
   https://your-production-domain.com/auth/callback
   ```

### 2. Configure Google OAuth (if not already done)

1. In Supabase Dashboard, go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret
   - Redirect URL: `https://vyddhllzjjpqxbouqivf.supabase.co/auth/v1/callback`

### 3. Run Database Migrations

Execute the following SQL in Supabase SQL Editor:

```sql
-- Create profile trigger if not exists
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id, 
    new.email,
    CASE 
      WHEN new.email = 'admin@example.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 4. Test Authentication

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Test login flow:
   - Email/Password login
   - Google OAuth login

### 5. Common Issues and Solutions

#### Issue: 400 Bad Request at token endpoint
**Solution**: Ensure redirect URLs are properly configured in Supabase Dashboard

#### Issue: Profile not created after signup
**Solution**: Check if the auth trigger is properly set up

#### Issue: Google login redirects to wrong URL
**Solution**: Update the redirect URL in AuthDialog.tsx to match your domain

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=https://vyddhllzjjpqxbouqivf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com
```

## Testing Checklist

- [ ] Email signup creates user and profile
- [ ] Email login works correctly
- [ ] Google OAuth login works
- [ ] Auth callback redirects properly
- [ ] Session persists on page refresh
- [ ] Logout clears session