require('dotenv').config();

console.log('🔍 Debugging ChessFi Backend Server...');
console.log('Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER);

// Test database connection first
const { sequelize } = require('./src/database/connection');

async function testDatabase() {
  try {
    console.log('\n🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Test basic Express server
async function testBasicServer() {
  try {
    console.log('\n🔍 Testing basic Express server...');
    const express = require('express');
    const app = express();
    
    app.get('/test', (req, res) => {
      res.json({ message: 'Basic server working!' });
    });
    
    const server = app.listen(3002, () => {
      console.log('✅ Basic server started on port 3002');
      server.close();
    });
    
    return true;
  } catch (error) {
    console.error('❌ Basic server test failed:', error.message);
    return false;
  }
}

// Test full server
async function testFullServer() {
  try {
    console.log('\n🔍 Testing full server...');
    const express = require('express');
    const cors = require('cors');
    const helmet = require('helmet');
    const morgan = require('morgan');
    const compression = require('compression');
    const rateLimit = require('express-rate-limit');
    const { createServer } = require('http');
    const { Server } = require('socket.io');
    
    const app = express();
    const server = createServer(app);
    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || "http://localhost:3000",
        methods: ["GET", "POST"]
      }
    });
    
    const PORT = process.env.PORT || 3001;
    
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
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });
    
    // Test endpoint
    app.get('/test', (req, res) => {
      res.json({ message: 'Full server working!' });
    });
    
    server.listen(PORT, () => {
      console.log(`✅ Full server started on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
      
      // Keep server running for 5 seconds then close
      setTimeout(() => {
        server.close();
        console.log('🔒 Server closed after test');
      }, 5000);
    });
    
    return true;
  } catch (error) {
    console.error('❌ Full server test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runDebugTests() {
  const dbOk = await testDatabase();
  const basicOk = await testBasicServer();
  const fullOk = await testFullServer();
  
  console.log('\n📊 DEBUG RESULTS:');
  console.log('Database:', dbOk ? '✅' : '❌');
  console.log('Basic Server:', basicOk ? '✅' : '❌');
  console.log('Full Server:', fullOk ? '✅' : '❌');
  
  if (dbOk && basicOk && fullOk) {
    console.log('\n🎉 All tests passed! Server should work.');
  } else {
    console.log('\n❌ Some tests failed. Check the errors above.');
  }
}

runDebugTests().catch(console.error);
