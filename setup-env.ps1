# ChessFi Environment Setup Script
# This script helps you set up the environment files for deployment

Write-Host "🚀 ChessFi Environment Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if .env files already exist
$contractsEnvExists = Test-Path "contracts\.env"
$frontendEnvExists = Test-Path "frontend\.env.local"

Write-Host "`n📁 Checking existing environment files..." -ForegroundColor Yellow

if ($contractsEnvExists) {
    Write-Host "✅ contracts\.env already exists" -ForegroundColor Green
} else {
    Write-Host "❌ contracts\.env not found" -ForegroundColor Red
}

if ($frontendEnvExists) {
    Write-Host "✅ frontend\.env.local already exists" -ForegroundColor Green
} else {
    Write-Host "❌ frontend\.env.local not found" -ForegroundColor Red
}

Write-Host "`n🔧 Setting up environment files..." -ForegroundColor Yellow

# Set up contracts environment
if (-not $contractsEnvExists) {
    if (Test-Path "contracts\env.template") {
        Copy-Item "contracts\env.template" "contracts\.env"
        Write-Host "✅ Created contracts\.env from template" -ForegroundColor Green
        Write-Host "📝 Edit contracts\.env with your private key and RPC URL" -ForegroundColor Yellow
    } else {
        Write-Host "❌ contracts\env.template not found" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  contracts\.env already exists - skipping" -ForegroundColor Blue
}

# Set up frontend environment
if (-not $frontendEnvExists) {
    if (Test-Path "frontend\env.template") {
        Copy-Item "frontend\env.template" "frontend\.env.local"
        Write-Host "✅ Created frontend\.env.local from template" -ForegroundColor Green
        Write-Host "📝 Edit frontend\.env.local after deploying contracts" -ForegroundColor Yellow
    } else {
        Write-Host "❌ frontend\env.template not found" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  frontend\.env.local already exists - skipping" -ForegroundColor Blue
}

Write-Host "`n📋 Next Steps:" -ForegroundColor Green
Write-Host "1. Edit contracts\.env with your private key and Sepolia RPC URL" -ForegroundColor White
Write-Host "2. Ensure you have Sepolia ETH (≥0.1 ETH)" -ForegroundColor White

Write-Host "3. Deploy contracts: cd contracts; npm run deploy:sepolia" -ForegroundColor White
Write-Host "4. Update frontend\.env.local with deployed contract addresses" -ForegroundColor White
Write-Host "5. Test the integration" -ForegroundColor White

Write-Host "`n🔐 Security Reminder:" -ForegroundColor Red
Write-Host "• NEVER commit .env files to version control" -ForegroundColor Red
Write-Host "• Keep your private key secure" -ForegroundColor Red
Write-Host "• Use testnet wallets for development" -ForegroundColor Red

Write-Host "`n✅ Environment setup complete!" -ForegroundColor Green
Write-Host "Check DEPLOYMENT_SETUP_GUIDE.md for detailed instructions" -ForegroundColor Blue
