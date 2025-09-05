# ChessFi Database Setup Guide

This guide will help you set up the ChessFi database with all required models and sample data.

## Prerequisites

1. **PostgreSQL** installed and running
2. **Node.js** and **npm** installed
3. **Environment variables** configured (see `.env.example`)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file and update with your database credentials:
```bash
cp .env.example .env
```

Edit `.env` with your database settings:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chessfi
DB_USER=your_username
DB_PASSWORD=your_password
```

### 3. Setup Database

Run the complete database setup (migration + seeding):
```bash
npm run setup-db
```

This will:

- Create all database tables
- Add performance indexes
- Insert sample data for testing

## Individual Commands

### Migration Only

```bash
npm run migrate
```
Creates tables and indexes without sample data.

### Seeding Only

```bash
npm run seed
```

Adds sample data to existing tables.

### Test Models

```bash
npm run test:models
```

Tests all model associations and functionality.

## Database Models

### Users

- **Primary Key**: UUID
- **Unique Fields**: username, email, wallet_address
- **Features**: Rating system, titles, preferences, verification status

### Games

- **Primary Key**: UUID
- **Relationships**: white_player, black_player, winner, tournament
- **Features**: Move history, time controls, stake amounts, game analysis

### Tournaments

- **Primary Key**: UUID
- **Relationships**: organizer, tournament_games
- **Features**: Swiss/elimination formats, prize pools, standings

### NFTs

- **Primary Key**: UUID
- **Relationships**: owner, creator
- **Features**: Rarity system, staking, trading, metadata

## Sample Data

The seeding process creates:

### Users (4)

- **ChessMaster2024** (Master, 2200 rating)
- **GrandmasterPro** (Grandmaster, 2500 rating)
- **ChessNovice** (Novice, 1200 rating)
- **TournamentOrganizer** (Expert, 1800 rating)

### Tournaments (2)

- **ChessFi Championship 2024** (Swiss format, 64 players)
- **Blitz Battle Royale** (Elimination format, 32 players)

### NFTs (3)

- **Golden King Avatar** (Legendary rarity)
- **Crystal Queen** (Epic rarity)
- **Mystical Forest Board** (Rare rarity)

### Games (2)

- One completed game between ChessMaster2024 and GrandmasterPro
- One active game between ChessNovice and TournamentOrganizer

## Database Schema

### Key Relationships

```

Users 1:N Games (as white_player, black_player, winner)
Users 1:N Tournaments (as organizer)
Users 1:N NFTs (as owner, creator)
Tournaments 1:N Games (as tournament_games)
```

### Indexes

- **Performance indexes** on frequently queried fields
- **Unique indexes** on username, email, wallet_address
- **Foreign key indexes** for all relationships

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure PostgreSQL is running
   - Check database credentials in `.env`
   - Verify database exists

2. **Permission Denied**
   - Check database user permissions
   - Ensure user can create tables

3. **Port Already in Use**
   - Change `DB_PORT` in `.env`
   - Or stop conflicting services

### Reset Database

To completely reset the database:

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS chessfi;"
psql -U postgres -c "CREATE DATABASE chessfi;"

# Run setup again
npm run setup-db
```

## Production Considerations

1. **Remove sample data** before production deployment
2. **Set up proper backups** for production database
3. **Configure connection pooling** for high traffic
4. **Monitor database performance** with proper indexes

## API Endpoints

Once the database is set up, you can use these endpoints:

- `GET /api/users/profile` - Get user profile
- `GET /api/games` - List games
- `GET /api/tournaments` - List tournaments
- `GET /api/nfts` - List NFTs
- `POST /api/auth/login` - User authentication

## Support

For issues with database setup:

1. Check the logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Check database user permissions

---

**Note**: This setup is designed for development. For production deployment, additional security and performance considerations apply.