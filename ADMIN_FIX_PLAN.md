# Admin Access Fix Plan

## Issue Identified
The admin authentication is failing because of inconsistent table references throughout the codebase.

### Current Situation
- **Database**: Uses `users_profile` table with `is_admin` boolean column
- **useAuth Hook**: Queries `profiles` table looking for `role` column
- **Result**: Admin check always returns false, blocking access to admin pages

### Files That Need Updates

#### 1. useAuth Hook (`/src/hooks/useAuth.tsx`)
**Lines 57-61**: Change table name from `profiles` to `users_profile`
**Lines 100-102**: Change role check logic to use `is_admin` and `is_coach` columns

#### 2. Admin API Route (`/src/app/api/admin/users/route.ts`)  
**Lines 34-38**: Update table name from `profiles` to `users_profile`
**Lines 90-101**: Update SELECT query to use correct table name

#### 3. Database - Set Admin Status
Execute SQL to set yuki@hamada.tokyo as admin:
```sql
UPDATE users_profile 
SET is_admin = true, is_coach = true
WHERE user_id IN (
  SELECT id FROM auth.users 
  WHERE email = 'yuki@hamada.tokyo'
);
```

### Implementation Steps
1. Fix useAuth hook table references
2. Fix admin API route table references  
3. Run SQL to set admin status in database
4. Test admin page access
5. Verify admin functionality works

### Expected Outcome
After these changes, yuki@hamada.tokyo should be able to:
- Log in successfully
- See admin navigation links
- Access `/admin` page without redirect
- View and manage users in admin panel