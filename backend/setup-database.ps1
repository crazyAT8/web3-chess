# ChessFi Backend Database Setup Script (PowerShell)
# This script helps you configure PostgreSQL for the ChessFi backend

Write-Host "🔧 ChessFi Backend Database Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if PostgreSQL is installed
Write-Host "📋 Checking PostgreSQL installation..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version 2>$null
    if ($psqlVersion) {
        Write-Host "✅ PostgreSQL is installed" -ForegroundColor Green
        Write-Host $psqlVersion -ForegroundColor Gray
    } else {
        throw "PostgreSQL not found"
    }
} catch {
    Write-Host "❌ PostgreSQL is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Installation instructions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Windows:" -ForegroundColor White
    Write-Host "1. Download from https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host "2. Or use Chocolatey: choco install postgresql" -ForegroundColor Gray
    Write-Host ""
    Write-Host "After installation, restart your terminal and run this script again." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Checking PostgreSQL service status..." -ForegroundColor Yellow
try {
    $pgReady = pg_isready 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
    } else {
        throw "PostgreSQL not running"
    }
} catch {
    Write-Host "❌ PostgreSQL service is not running" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Start PostgreSQL service:" -ForegroundColor Yellow
    Write-Host "1. Open Services (services.msc)" -ForegroundColor Gray
    Write-Host "2. Find 'postgresql' service and start it" -ForegroundColor Gray
    Write-Host "3. Or use: net start postgresql-x64-14" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "📋 Setting up ChessFi database..." -ForegroundColor Yellow
Write-Host ""

# Get database credentials
$DB_USER = Read-Host "Enter PostgreSQL username (default: postgres)"
if ([string]::IsNullOrEmpty($DB_USER)) { $DB_USER = "postgres" }

$DB_PASSWORD = Read-Host "Enter PostgreSQL password" -AsSecureString
$DB_PASSWORD_PLAIN = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($DB_PASSWORD))

$DB_HOST = Read-Host "Enter PostgreSQL host (default: localhost)"
if ([string]::IsNullOrEmpty($DB_HOST)) { $DB_HOST = "localhost" }

$DB_PORT = Read-Host "Enter PostgreSQL port (default: 5432)"
if ([string]::IsNullOrEmpty($DB_PORT)) { $DB_PORT = "5432" }

Write-Host ""
Write-Host "🔧 Creating ChessFi database..." -ForegroundColor Yellow

# Set environment variable for password
$env:PGPASSWORD = $DB_PASSWORD_PLAIN

# Create database
try {
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE chessfi;" 2>$null
    Write-Host "✅ Database 'chessfi' created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database creation failed or already exists" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Creating .env file..." -ForegroundColor Yellow

# Create .env file
$envContent = @"
# ChessFi Backend Environment Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=chessfi
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD_PLAIN

# JWT Configuration
JWT_SECRET=chessfi-super-secret-jwt-key-2024-development-change-in-production
JWT_EXPIRES_IN=7d

# Contract Addresses (Sepolia Testnet)
CHESS_TOKEN_CONTRACT=0x0E887B3aAd61c724De20308cc7a3d6d8197A992a
NFT_CONTRACT=0x91a32Ce740BE656f8F150806d9d4a22518136415
GAME_CONTRACT=0x3DF6f0284Bf92fd48c5517b9cA9788aB479f0796
TOURNAMENT_CONTRACT=0x3a34F400393cB1193616dF72Eb843Fe826ABC137

# Network Configuration
CHAIN_ID=11155111
NETWORK_NAME=sepolia

# CORS
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ .env file created successfully" -ForegroundColor Green

Write-Host ""
Write-Host "🧪 Testing database connection..." -ForegroundColor Yellow

# Test connection
node test-db.js

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "🎉 Database setup completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run database migrations: npm run setup-db" -ForegroundColor White
    Write-Host "2. Start the backend server: npm run dev" -ForegroundColor White
    Write-Host "3. Test the API: http://localhost:3001/health" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Database connection test failed" -ForegroundColor Red
    Write-Host "Please check your PostgreSQL configuration and try again" -ForegroundColor Yellow
}

# Clear password from environment
Remove-Item Env:PGPASSWORD
