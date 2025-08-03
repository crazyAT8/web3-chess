const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupDatabase() {
  console.log('🔧 PostgreSQL Database Setup for ChessFi');
  console.log('========================================\n');

  console.log('📋 Please provide your PostgreSQL configuration:');
  
  const dbHost = await question('Database Host (default: localhost): ') || 'localhost';
  const dbPort = await question('Database Port (default: 5432): ') || '5432';
  const dbName = await question('Database Name (default: chessfi): ') || 'chessfi';
  const dbUser = await question('Database User (default: postgres): ') || 'postgres';
  const dbPassword = await question('Database Password: ');

  if (!dbPassword) {
    console.error('❌ Database password is required!');
    rl.close();
    return;
  }

  // Create .env content
  const envContent = `# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=${dbHost}
DB_PORT=${dbPort}
DB_NAME=${dbName}
DB_USER=${dbUser}
DB_PASSWORD=${dbPassword}

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Web3 Configuration
ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/your-api-key
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your-api-key
MUMBAI_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/your-api-key

# Contract Addresses
CHESS_TOKEN_CONTRACT=0x...
NFT_CONTRACT=0x...
GAME_CONTRACT=0x...

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
`;

  try {
    fs.writeFileSync('.env', envContent);
    console.log('\n✅ .env file created successfully!');
    
    console.log('\n📋 Your database configuration:');
    console.log(`   Host: ${dbHost}`);
    console.log(`   Port: ${dbPort}`);
    console.log(`   Database: ${dbName}`);
    console.log(`   User: ${dbUser}`);
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Make sure PostgreSQL is installed and running');
    console.log('   2. Create the database if it doesn\'t exist:');
    console.log(`      CREATE DATABASE ${dbName};`);
    console.log('   3. Run the database test: node test-db.js');
    console.log('   4. Start the server: npm start');
    
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }

  rl.close();
}

setupDatabase(); 