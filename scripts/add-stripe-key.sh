#!/bin/bash

echo "Stripe Publishable Key を追加してください"
echo ""
echo "1. https://dashboard.stripe.com/apikeys にアクセス"
echo "2. Publishable key (pk_live_...) をコピー"
echo "3. 以下のコマンドを実行:"
echo ""
echo "echo 'YOUR_PK_KEY' | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production"
echo ""
echo "例:"
echo "echo 'pk_live_51KIU7BDqLakc8NxkQJGlUUHu06VXqYjXr8RJkTCZEtQtwAMRRSyVo9lmaoiRSenUe38dimeUpJHLx1lGJ7Jv338O00K11ASMXk' | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production"