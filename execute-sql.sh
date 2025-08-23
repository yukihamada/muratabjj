#!/bin/bash

# Execute SQL directly via Supabase API
SUPABASE_URL="https://vyddhllzjjpqxbouqivf.supabase.co"
SUPABASE_SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d '=' -f2)

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "❌ SUPABASE_SERVICE_ROLE_KEY not found in .env.local"
  exit 1
fi

echo "🚀 Executing migration via Supabase API..."

# Read SQL file
SQL_CONTENT=$(cat supabase/migrations/007_fix_database_issues.sql)

# Execute via REST API
curl -X POST "$SUPABASE_URL/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": \"$SQL_CONTENT\"}"

echo -e "\n\nAlternatively, you can execute the migration directly in the SQL Editor:"
echo "https://supabase.com/dashboard/project/vyddhllzjjpqxbouqivf/editor"