
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');

const { sequelize } = require('./src/database/connection');
const { setupSocketHandlers } = require('./src/socket/handlers');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const gameRoutes = require('./src/routes/games');
const tournamentRoutes = require('./src/routes/tournaments');
const nftRoutes = require('./src/routes/nfts');
const leaderboardRoutes = require('./src/routes/leaderboard');
const { errorHandler } = require('./src/middleware/errorHandler');
const { authenticateToken } = require('./src/middleware/auth');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'connected'
  });
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ 
    message: 'ChessFi Backend API is working!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/games', authenticateToken, gameRoutes);
app.use('/api/tournaments', authenticateToken, tournamentRoutes);
app.use('/api/nfts', authenticateToken, nftRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Socket.IO setup
setupSocketHandlers(io);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database connection and server startup
async function startServer() {
  try {
    console.log('🚀 Starting ChessFi Backend Server...');
    
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    
    // Sync database models (in development)
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    }

    server.listen(PORT, () => {
      console.log(`🚀 ChessFi Backend Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
      console.log(`🔌 Socket.IO ready for real-time connections`);
      console.log(`\n📋 Available API Endpoints:`);
      console.log(`   GET  /health - Server health check`);
      console.log(`   GET  /test - Test endpoint`);
      console.log(`   POST /api/auth/register - User registration`);
      console.log(`   POST /api/auth/login - User login`);
      console.log(`   GET  /api/leaderboard - Public leaderboard`);
      console.log(`   GET  /api/users - Get users (requires auth)`);
      console.log(`   GET  /api/games - Get games (requires auth)`);
      console.log(`   GET  /api/tournaments - Get tournaments (requires auth)`);
      console.log(`   GET  /api/nfts - Get NFTs (requires auth)`);
      console.log(`\n🎉 Server is ready for testing!`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});

startServer();
