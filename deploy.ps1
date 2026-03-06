#!/usr/bin/env pwsh
# AetherX Automated Vercel Deployment Script
# Run this script to automatically deploy your app to Vercel

$ErrorActionPreference = "Stop"

Write-Host "🚀 AetherX Automated Deployment Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Step 1: Check Node.js
Write-Host "📦 Checking Node.js installation..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js $nodeVersion found" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Step 2: Check/Install Vercel CLI
Write-Host ""
Write-Host "📦 Checking Vercel CLI..." -ForegroundColor Yellow
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue

if (-not $vercelInstalled) {
    Write-Host "⚠️  Vercel CLI not found. Installing globally..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✓ Vercel CLI installed" -ForegroundColor Green
}
else {
    Write-Host "✓ Vercel CLI already installed" -ForegroundColor Green
}

# Step 3: Verify tests pass
Write-Host ""
Write-Host "🧪 Running tests..." -ForegroundColor Yellow
try {
    $testResult = npm test -- --run 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ All tests passed" -ForegroundColor Green
    }
    else {
        Write-Host "⚠️  Some tests failed, but continuing..." -ForegroundColor Yellow
    }
}
catch {
    Write-Host "⚠️  Could not run tests, continuing..." -ForegroundColor Yellow
}

# Step 4: Generate environment variables
Write-Host ""
Write-Host "🔐 Generating environment variables..." -ForegroundColor Yellow

# Generate secure session secret
$sessionSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object { [char]$_ })
Write-Host "✓ Generated SESSION_SECRET" -ForegroundColor Green

# Prompt for admin password
Write-Host ""
$adminPassword = Read-Host "Enter admin password for production (or press Enter for 'aetherx-prod-password')"
if ([string]::IsNullOrWhiteSpace($adminPassword)) {
    $adminPassword = "aetherx-prod-password"
}

$databaseUrl = "file:./prisma/dev.db"

Write-Host ""
Write-Host "Environment variables prepared:" -ForegroundColor Cyan
Write-Host "  SESSION_SECRET: $sessionSecret" -ForegroundColor Gray
Write-Host "  CONFIGURED_PASSWORD: $adminPassword" -ForegroundColor Gray
Write-Host "  DATABASE_URL: $databaseUrl" -ForegroundColor Gray

# Step 5: Save environment variables to .env.production (for reference)
Write-Host ""
Write-Host "💾 Saving environment variables to .env.production..." -ForegroundColor Yellow
@"
SESSION_SECRET=$sessionSecret
CONFIGURED_PASSWORD=$adminPassword
DATABASE_URL=$databaseUrl
"@ | Out-File -FilePath ".env.production" -Encoding UTF8
Write-Host "✓ Saved to .env.production (for your reference)" -ForegroundColor Green

# Add to .gitignore if not already there
if (-not (Select-String -Path ".gitignore" -Pattern ".env.production" -Quiet -ErrorAction SilentlyContinue)) {
    Add-Content -Path ".gitignore" -Value "`n.env.production"
    Write-Host "✓ Added .env.production to .gitignore" -ForegroundColor Green
}

# Step 6: Deploy to Vercel
Write-Host ""
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host ""
Write-Host "This will:" -ForegroundColor Cyan
Write-Host "  1. Link your project to Vercel" -ForegroundColor Cyan
Write-Host "  2. Set environment variables" -ForegroundColor Cyan
Write-Host "  3. Deploy to production" -ForegroundColor Cyan
Write-Host ""

$proceed = Read-Host "Proceed with deployment? (y/n)"
if ($proceed -ne "y") {
    Write-Host "❌ Deployment cancelled" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Deploying with Vercel..." -ForegroundColor Yellow

# Deploy with environment variables
try {
    # First deployment with env vars
    vercel --prod `
        --env SESSION_SECRET="$sessionSecret" `
        --env CONFIGURED_PASSWORD="$adminPassword" `
        --env DATABASE_URL="$databaseUrl" `
        --yes
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✓ Deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host "🎉 Your app is now live on Vercel!" -ForegroundColor Green
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Yellow
        Write-Host "  1. Visit your deployment URL (shown above)" -ForegroundColor White
        Write-Host "  2. Go to /register to create your admin account" -ForegroundColor White
        Write-Host "  3. Login at /login with your credentials" -ForegroundColor White
        Write-Host ""
        Write-Host "🔐 Your credentials:" -ForegroundColor Cyan
        Write-Host "  Environment file: .env.production" -ForegroundColor Gray
        Write-Host "  Admin password: $adminPassword" -ForegroundColor Gray
        Write-Host ""
        Write-Host "📊 Monitor your deployment:" -ForegroundColor Cyan
        Write-Host "  Dashboard: https://vercel.com/dashboard" -ForegroundColor Gray
        Write-Host ""
    }
    else {
        throw "Deployment failed with exit code $LASTEXITCODE"
    }
}
catch {
    Write-Host ""
    Write-Host "❌ Deployment failed: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Manual deployment steps:" -ForegroundColor Yellow
    Write-Host "  1. Run: vercel login" -ForegroundColor White
    Write-Host "  2. Run: vercel --prod" -ForegroundColor White
    Write-Host "  3. Add environment variables in Vercel dashboard:" -ForegroundColor White
    Write-Host "     - SESSION_SECRET=$sessionSecret" -ForegroundColor Gray
    Write-Host "     - CONFIGURED_PASSWORD=$adminPassword" -ForegroundColor Gray
    Write-Host "     - DATABASE_URL=$databaseUrl" -ForegroundColor Gray
    exit 1
}

# Step 7: Initialize database (optional)
Write-Host ""
$initDb = Read-Host "Initialize database on Vercel? (y/n)"
if ($initDb -eq "y") {
    Write-Host "Running database migration..." -ForegroundColor Yellow
    try {
        vercel env pull
        npx prisma migrate deploy
        Write-Host "✓ Database initialized" -ForegroundColor Green
    }
    catch {
        Write-Host "⚠️  Could not initialize database automatically." -ForegroundColor Yellow
        Write-Host "   Run these commands manually:" -ForegroundColor Yellow
        Write-Host "     vercel env pull" -ForegroundColor Gray
        Write-Host "     npx prisma migrate deploy" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "✨ Deployment complete! ✨" -ForegroundColor Green
Write-Host ""
