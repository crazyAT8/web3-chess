#!/bin/bash

# ChessFi Backend Database Setup Script
# This script helps you configure PostgreSQL for the ChessFi backend

echo "🔧 ChessFi Backend Database Setup"
echo "================================="
echo ""

# Check if PostgreSQL is installed
echo "📋 Checking PostgreSQL installation..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL is installed"
    psql --version
else
    echo "❌ PostgreSQL is not installed"
    echo ""
    echo "🔧 Installation instructions:"
    echo ""
    echo "Windows:"
    echo "1. Download from https://www.postgresql.org/download/windows/"
    echo "2. Or use Chocolatey: choco install postgresql"
    echo ""
    echo "macOS:"
    echo "1. Use Homebrew: brew install postgresql"
    echo "2. Start service: brew services start postgresql"
    echo ""
    echo "Linux (Ubuntu/Debian):"
    echo "1. sudo apt update && sudo apt install postgresql postgresql-contrib"
    echo "2. sudo systemctl start postgresql"
    echo ""
    exit 1
fi

echo ""
echo "📋 Checking PostgreSQL service status..."
if pg_isready -q; then
    echo "✅ PostgreSQL service is running"
else
    echo "❌ PostgreSQL service is not running"
    echo ""
    echo "🔧 Start PostgreSQL service:"
    echo "Windows: Start PostgreSQL service from Services"
    echo "macOS: brew services start postgresql"
    echo "Linux: sudo systemctl start postgresql"
    echo ""
    exit 1
fi

echo ""
echo "📋 Setting up ChessFi database..."
echo ""

# Get database credentials
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -s -p "Enter PostgreSQL password: " DB_PASSWORD
echo ""

read -p "Enter PostgreSQL host (default: localhost): " DB_HOST
DB_HOST=${DB_HOST:-localhost}

read -p "Enter PostgreSQL port (default: 5432): " DB_PORT
DB_PORT=${DB_PORT:-5432}

echo ""
echo "🔧 Creating ChessFi database..."

# Create database
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -c "CREATE DATABASE chessfi;" 2>/dev/null || echo "Database 'chessfi' might already exist"

if [ $? -eq 0 ]; then
    echo "✅ Database 'chessfi' created successfully"
else
    echo "⚠️  Database creation failed or already exists"
fi

echo ""
echo "📋 Creating .env file..."

# Create .env file
cat > .env << EOF
# ChessFi Backend Environment Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=chessfi
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

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
EOF

echo "✅ .env file created successfully"
echo ""
echo "🧪 Testing database connection..."

# Test connection
node test-db.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Database setup completed successfully!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Run database migrations: npm run setup-db"
    echo "2. Start the backend server: npm run dev"
    echo "3. Test the API: http://localhost:3001/health"
else
    echo ""
    echo "❌ Database connection test failed"
    echo "Please check your PostgreSQL configuration and try again"
fi
