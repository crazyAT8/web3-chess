# ChessFi Backend API

A comprehensive backend API for the ChessFi Web3 chess gaming platform, built with Node.js, Express, PostgreSQL, and Socket.IO.

## 🚀 Features

- **Authentication**: Wallet-based authentication with JWT tokens
- **Real-time Gameplay**: Socket.IO for live chess games
- **User Management**: Profiles, ratings, statistics
- **Game System**: Chess games with move validation and game state
- **Tournaments**: Tournament creation and management
- **NFT Marketplace**: Chess piece and avatar NFTs
- **Leaderboards**: Global rankings and statistics
- **Database**: PostgreSQL with Sequelize ORM
- **Security**: Rate limiting, CORS, input validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- Redis (optional, for caching)

## 🛠️ Installation

1. **Clone the repository**

   ```bash
   cd backend
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=chessfi
   DB_USER=postgres
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   
   # Server
   PORT=3001
   NODE_ENV=development
   ```

4. **Set up the database**

   ```bash
   # Create PostgreSQL database
   createdb chessfi
   
   # Run migrations (auto-sync in development)
   npm run dev
   ```

5. **Start the server**

   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

### Authentication

#### Get Nonce for Wallet Authentication

```http
GET /api/auth/nonce/:wallet_address
```

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "ChessMaster",
  "wallet_address": "0x1234...",
  "email": "player@example.com"
}
```

#### Login with Wallet Signature

```http
POST /api/auth/login
Content-Type: application/json

{
  "wallet_address": "0x1234...",
  "signature": "0x...",
  "message": "Sign this message to authenticate with ChessFi. Nonce: 123456"
}
```

### Game Management

#### Create New Game

```http
POST /api/games
Authorization: Bearer <token>
Content-Type: application/json

{
  "opponent_id": "user-uuid",
  "game_type": "rapid",
  "time_control": 10,
  "increment": 0,
  "stake_amount": 50
}
```

#### Make a Move

```http
POST /api/games/:gameId/move
Authorization: Bearer <token>
Content-Type: application/json

{
  "from": "e2",
  "to": "e4",
  "promotion": "q"
}
```

#### Get User Games

```http
GET /api/games?status=active&limit=20&offset=0
Authorization: Bearer <token>
```

### User Management

#### Get User Profile

```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Search Users

```http
GET /api/users/search/ChessMaster?limit=10
Authorization: Bearer <token>
```

#### Get Online Users

```http
GET /api/users/online/list?limit=50
Authorization: Bearer <token>
```

### Tournament Management

#### Create Tournament

```http
POST /api/tournaments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Weekly Championship",
  "description": "Weekly chess tournament",
  "format": "swiss",
  "start_date": "2024-01-15T10:00:00Z",
  "max_participants": 64,
  "time_control": 10,
  "entry_fee": 10,
  "prize_pool": {
    "first": 500,
    "second": 300,
    "third": 200
  }
}
```

#### Register for Tournament

```http
POST /api/tournaments/:tournamentId/register
Authorization: Bearer <token>
```

### NFT Management

#### Mint NFT

```http
POST /api/nfts/mint
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Golden King",
  "description": "Legendary golden chess king",
  "nft_type": "piece",
  "rarity": "legendary",
  "attributes": [
    {"trait_type": "Power", "value": 95},
    {"trait_type": "Speed", "value": 80}
  ],
  "stats": {
    "attack": 95,
    "defense": 90,
    "speed": 80,
    "intelligence": 85
  },
  "mint_price": 100
}
```

#### Get User NFTs

```http
GET /api/nfts/my?type=piece&rarity=legendary
Authorization: Bearer <token>
```

#### Stake NFT

```http
POST /api/nfts/:nftId/stake
Authorization: Bearer <token>
```

### Leaderboard & Statistics

#### Get Global Leaderboard

```http
GET /api/leaderboard/global?limit=100&offset=0
```

#### Get Platform Statistics

```http
GET /api/leaderboard/stats
```

## 🔌 Socket.IO Events

### Client to Server

#### Join Game Room

```javascript
socket.emit('join-game', gameId);
```

#### Make Move

```javascript
socket.emit('make-move', {
  gameId: 'game-uuid',
  move: {
    from: 'e2',
    to: 'e4',
    piece: 'p',
    san: 'e4'
  }
});
```

#### Send Chat Message

```javascript
socket.emit('chat-message', {
  gameId: 'game-uuid',
  message: 'Good move!'
});
```

#### Offer Draw

```javascript
socket.emit('draw-offer', gameId);
```

#### Resign Game

```javascript
socket.emit('resign', gameId);
```

### Server to Client

#### Game State Update

```javascript
socket.on('game-state', (data) => {
  console.log('Game state:', data);
});
```

#### Move Made

```javascript
socket.on('move-made', (data) => {
  console.log('Move made:', data);
});
```

#### Chat Message

```javascript
socket.on('chat-message', (data) => {
  console.log('Chat:', data);
});
```

#### Game Ended

```javascript
socket.on('game-ended', (data) => {
  console.log('Game ended:', data);
});
```

## 🗄️ Database Schema

### Users

- `id` (UUID, Primary Key)
- `username` (String, Unique)
- `wallet_address` (String, Unique)
- `email` (String, Optional)
- `rating` (Integer, Default: 1200)
- `games_played`, `games_won`, `games_drawn`, `games_lost` (Integer)
- `win_rate` (Decimal)
- `title` (Enum: Novice, Amateur, Expert, Master, Grandmaster)
- `total_earnings` (Decimal)
- `is_online` (Boolean)
- `preferences` (JSONB)

### Games

- `id` (UUID, Primary Key)
- `white_player_id`, `black_player_id` (UUID, Foreign Keys)
- `game_type` (Enum: blitz, rapid, classical, bullet)
- `time_control`, `increment` (Integer)
- `status` (Enum: pending, active, completed, abandoned, draw)
- `result` (Enum: white_win, black_win, draw, abandoned)
- `winner_id` (UUID, Foreign Key)
- `initial_fen`, `current_fen` (String)
- `moves` (JSONB)
- `white_time_remaining`, `black_time_remaining` (Integer)
- `current_turn` (Enum: white, black)
- `stake_amount` (Decimal)

### Tournaments

- `id` (UUID, Primary Key)
- `name`, `description` (String)
- `format` (Enum: swiss, round_robin, elimination, blitz, rapid)
- `status` (Enum: upcoming, registration, active, completed, cancelled)
- `start_date`, `end_date` (Date)
- `max_participants`, `current_participants` (Integer)
- `entry_fee`, `total_prize_pool` (Decimal)
- `prize_pool` (JSONB)
- `organizer_id` (UUID, Foreign Key)

### NFTs

- `id` (UUID, Primary Key)
- `token_id` (String, Unique)
- `contract_address` (String)
- `owner_id`, `creator_id` (UUID, Foreign Keys)
- `nft_type` (Enum: piece, avatar, board, collection)
- `name`, `description` (String)
- `rarity` (Enum: common, uncommon, rare, epic, legendary, mythic)
- `attributes`, `stats`, `abilities` (JSONB)
- `mint_price`, `current_price`, `last_sale_price` (Decimal)
- `is_staked`, `staking_rewards` (Boolean/Decimal)

## 🔧 Development

### Project Structure

```
backend/
├── src/
│   ├── index.js              # Main server file
│   ├── database/
│   │   └── connection.js     # Database connection
│   ├── models/               # Sequelize models
│   │   ├── User.js
│   │   ├── Game.js
│   │   ├── Tournament.js
│   │   ├── NFT.js
│   │   └── index.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── games.js
│   │   ├── tournaments.js
│   │   ├── nfts.js
│   │   └── leaderboard.js
│   ├── middleware/           # Custom middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   └── socket/               # Socket.IO handlers
│       └── handlers.js
├── package.json
├── env.example
└── README.md
```

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

### Environment Variables

- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` - Database configuration
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `CORS_ORIGIN` - Allowed CORS origin
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window
- `RATE_LIMIT_MAX_REQUESTS` - Rate limiting max requests

## 🚀 Deployment

### Production Setup

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure CORS for your domain
5. Set up SSL/TLS certificates
6. Use PM2 or similar process manager

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the API documentation
- Review the Socket.IO events documentation

## 🔮 Roadmap

- [ ] Advanced chess engine integration
- [ ] Tournament bracket generation
- [ ] NFT trading marketplace
- [ ] Social features (friends, clubs)
- [ ] Mobile app support
- [ ] Analytics dashboard
- [ ] Admin panel
- [ ] Multi-language support 