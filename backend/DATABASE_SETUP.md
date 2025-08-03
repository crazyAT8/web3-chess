# PostgreSQL Database Setup and Testing Guide

## Prerequisites

Before testing your PostgreSQL connection, you need to have PostgreSQL installed and running on your system.

## Installation Options

### Option 1: Official PostgreSQL Installer (Recommended)

1. Download from: <https://www.postgresql.org/download/windows/>
2. Run the installer
3. Set a password for the `postgres` user during installation
4. Keep the default port (5432)

### Option 2: Using Docker

```bash
# Pull and run PostgreSQL container
docker run --name postgres-chessfi \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=chessfi \
  -p 5432:5432 \
  -d postgres:15

# To stop the container
docker stop postgres-chessfi

# To start it again
docker start postgres-chessfi
```

### Option 3: Using Chocolatey

```powershell
choco install postgresql
```

## Setup Steps

### Step 1: Configure Environment Variables

Run the setup script to create your `.env` file:

```bash
node setup-database.js
```

This will prompt you for:

- Database host (default: localhost)
- Database port (default: 5432)
- Database name (default: chessfi)
- Database user (default: postgres)
- Database password

### Step 2: Create Database (if needed)

If you're using the official installer, you may need to create the database:

1. Open pgAdmin (comes with PostgreSQL installer)
2. Connect to your PostgreSQL server
3. Right-click on "Databases" → "Create" → "Database"
4. Name it `chessfi`

Or using command line:

```bash
# Connect to PostgreSQL
psql -U postgres -h localhost

# Create database
CREATE DATABASE chessfi;

# Exit
\q
```

### Step 3: Test Database Connection

Run the database test script:

```bash
node test-db.js
```

Expected output if successful:

```bash
🔍 Testing PostgreSQL connection...
📋 Connection details:
   Host: localhost
   Port: 5432
   Database: chessfi
   User: postgres

✅ Database connection established successfully!
✅ Database query test successful!
📊 PostgreSQL version: PostgreSQL 15.x...
📁 Connected to database: chessfi

🎉 All database tests passed! PostgreSQL is properly configured.
🔌 Database connection closed.
```

## Troubleshooting

### Common Error: Connection Refused

**Error**: `ECONNREFUSED`
**Solution**: 

- Make sure PostgreSQL service is running
- Check if PostgreSQL is installed
- Verify the port (5432) is not blocked by firewall

### Common Error: Authentication Failed

**Error**: `28P01`
**Solution**:

- Check username and password in `.env` file
- Verify the user exists in PostgreSQL
- Try connecting with pgAdmin to test credentials

### Common Error: Database Does Not Exist

**Error**: `3D000`
**Solution**:

- Create the database: `CREATE DATABASE chessfi;`
- Or change the database name in your `.env` file

### Common Error: Permission Denied

**Error**: `42501`
**Solution**:

- Grant necessary permissions to your user
- Make sure the user can connect to the database

## Testing Your Full Application

Once the database connection is working, you can test your full application:

1. **Start the server**:

   ```bash
   npm start
   ```

2. **Check the health endpoint**:

   ```bash
   curl http://localhost:3001/health
   ```

3. **Test database sync** (should happen automatically in development):
   - Check the console output for database synchronization messages
   - Look for "Database models synchronized" message

## Database Models

Your application includes these models:

- `User` - User accounts and profiles
- `Game` - Chess game data
- `Tournament` - Tournament information
- `NFT` - NFT metadata and ownership
- Leaderboard data

All models will be automatically created when you start the server in development mode.

## Production Considerations

For production:

1. Change `NODE_ENV` to `production`
2. Use a strong `JWT_SECRET`
3. Set up proper database backups
4. Configure connection pooling
5. Use environment-specific database credentials
6. Disable database auto-sync (`sequelize.sync()`)

## Useful Commands

```bash
# Test database connection
node test-db.js

# Setup database configuration
node setup-database.js

# Start the server
npm start

# Check if PostgreSQL is running (Windows)
Get-Service -Name "*postgres*"

# Connect to PostgreSQL directly
psql -U postgres -h localhost -d chessfi
```
 