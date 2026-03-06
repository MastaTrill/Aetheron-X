#!/bin/bash
# AetherX Automated Vercel Deployment Script (Bash version)
# For Linux/Mac or Git Bash on Windows

set -e

echo "🚀 AetherX Automated Deployment Script"
echo "======================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Check Node.js
echo "📦 Checking Node.js installation..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "✓ Node.js $NODE_VERSION found"
else
    echo "❌ Node.js not found. Please install Node.js first."
    exit 1
fi

# Step 2: Check/Install Vercel CLI
echo ""
echo "📦 Checking Vercel CLI..."
if ! command -v vercel >/dev/null 2>&1; then
    echo "⚠️  Vercel CLI not found. Installing globally..."
    npm install -g vercel
    echo "✓ Vercel CLI installed"
else
    echo "✓ Vercel CLI already installed"
fi

# Step 3: Generate environment variables
echo ""
echo "🔐 Generating environment variables..."

# Generate secure session secret
SESSION_SECRET=$(LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 32)
echo "✓ Generated SESSION_SECRET"

# Prompt for admin password
echo ""
read -p "Enter admin password for production (or press Enter for 'aetherx-prod-password'): " ADMIN_PASSWORD
ADMIN_PASSWORD=${ADMIN_PASSWORD:-aetherx-prod-password}

DATABASE_URL="file:./prisma/dev.db"

echo ""
echo "Environment variables prepared:"
echo "  SESSION_SECRET: $SESSION_SECRET"
echo "  CONFIGURED_PASSWORD: $ADMIN_PASSWORD"
echo "  DATABASE_URL: $DATABASE_URL"

# Step 4: Save environment variables
echo ""
echo "💾 Saving environment variables to .env.production..."
cat > .env.production << EOF
SESSION_SECRET=$SESSION_SECRET
CONFIGURED_PASSWORD=$ADMIN_PASSWORD
DATABASE_URL=$DATABASE_URL
EOF
echo "✓ Saved to .env.production"

# Add to .gitignore
if ! grep -q ".env.production" .gitignore 2>/dev/null; then
    echo "" >> .gitignore
    echo ".env.production" >> .gitignore
    echo "✓ Added .env.production to .gitignore"
fi

# Step 5: Deploy
echo ""
echo "🚀 Deploying to Vercel..."
echo ""
read -p "Proceed with deployment? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Deployment cancelled"
    exit 0
fi

echo "Deploying with Vercel..."
vercel --prod \
    --env SESSION_SECRET="$SESSION_SECRET" \
    --env CONFIGURED_PASSWORD="$ADMIN_PASSWORD" \
    --env DATABASE_URL="$DATABASE_URL" \
    --yes

echo ""
echo "✓ Deployment successful!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Your app is now live on Vercel!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Next steps:"
echo "  1. Visit your deployment URL"
echo "  2. Go to /register to create admin account"
echo "  3. Login at /login"
echo ""
echo "🔐 Credentials saved in: .env.production"
echo ""
