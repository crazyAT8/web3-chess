require('dotenv').config();
const { sequelize } = require('./src/database/connection');

async function testDatabaseConnection() {
  console.log('🔍 Testing PostgreSQL connection...');
  console.log('📋 Connection details:');
  console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.DB_PORT || 5432}`);
  console.log(`   Database: ${process.env.DB_NAME || 'chessfi'}`);
  console.log(`   User: ${process.env.DB_USER || 'postgres'}`);
  console.log('');

  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully!');
    
    // Test a simple query
    const [results] = await sequelize.query('SELECT version()');
    console.log('✅ Database query test successful!');
    console.log(`📊 PostgreSQL version: ${results[0].version}`);
    
    // Test if we can access the database
    const [databases] = await sequelize.query('SELECT current_database()');
    console.log(`📁 Connected to database: ${databases[0].current_database}`);
    
    console.log('\n🎉 All database tests passed! PostgreSQL is properly configured.');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    console.error('\n🔧 Troubleshooting tips:');
    console.error('   1. Make sure PostgreSQL is installed and running');
    console.error('   2. Verify your .env file has correct database credentials');
    console.error('   3. Check if the database "chessfi" exists');
    console.error('   4. Ensure the user has proper permissions');
    console.error('   5. Verify the port 5432 is not blocked by firewall');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 PostgreSQL might not be running. Try:');
      console.error('   - Start PostgreSQL service');
      console.error('   - Check if PostgreSQL is installed');
    }
    
    if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Check your username and password in .env');
    }
    
    if (error.code === '3D000') {
      console.error('\n💡 Database does not exist. Create it with:');
      console.error('   CREATE DATABASE chessfi;');
    }
  } finally {
    await sequelize.close();
    console.log('\n🔌 Database connection closed.');
  }
}

testDatabaseConnection(); 