#!/bin/bash

# Vercel Environment Variables Setup Script
# This script helps set up environment variables for Vercel deployment

echo "Setting up Vercel environment variables..."

# Read from .env.local
if [ -f .env.local ]; then
    echo "Reading from .env.local..."
    
    # Extract and set environment variables
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        if [[ ! $key =~ ^# ]] && [[ -n $key ]]; then
            # Remove quotes if present
            value="${value%\"}"
            value="${value#\"}"
            
            echo "Setting $key..."
            echo "$value" | vercel env add "$key" production --yes || echo "Failed to set $key"
        fi
    done < .env.local
    
    echo "Environment variables setup complete!"
else
    echo "Error: .env.local file not found"
    echo "Please create .env.local with your environment variables"
    exit 1
fi

echo ""
echo "Next steps:"
echo "1. Go to https://vercel.com/yukihamadas-projects/muratabjjv2/settings/environment-variables"
echo "2. Verify all environment variables are set correctly"
echo "3. Trigger a new deployment"