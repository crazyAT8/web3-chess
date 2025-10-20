# ChessFi Backend Database Setup Guide

## 🚀 Quick Setup Instructions

### Step 1: Install PostgreSQL

**Windows:**

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings (remember the password you set!)
3. Start PostgreSQL service from Services (services.msc)

**macOS:**

```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

Open PostgreSQL command line and create the database:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create the database
CREATE DATABASE chessfi;

-- Exit
\q
```

### Step 3: Create Environment File

Create a file named `.env` in the `backend` directory with this content:

```env
# ChessFi Backend Environment Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chessfi
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

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
```

**Important:** Replace `your_postgres_password_here` with your actual PostgreSQL password!

### Step 4: Test Database Connection

```bash
cd backend
node test-db.js
```

### Step 5: Run Database Setup

```bash
npm run setup-db
```

### Step 6: Start Backend Server

```bash
npm run dev
```

### Step 7: Test API

Open http://localhost:3001/health in your browser

## 🔧 Troubleshooting

### Common Issues:

1. **"Connection refused"**
   - Make sure PostgreSQL is running
   - Check if port 5432 is open

2. **"Authentication failed"**
   - Check your username and password in .env
   - Make sure the user has proper permissions

3. **"Database does not exist"**
   - Create the database: `CREATE DATABASE chessfi;`

4. **"Permission denied"**
   - Make sure the user can create tables
   - Check database user permissions

## 🎯 Success Indicators

- ✅ Database connection test passes
- ✅ Backend server starts without errors
- ✅ Health endpoint returns 200 OK
- ✅ Database tables are created

## 📋 Next Steps

After successful database setup:

1. Test the API endpoints
2. Set up frontend connection
3. Test contract integration
4. Implement authentication flow
