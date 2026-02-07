require('dotenv').config();
const { Client } = require('pg');

async function createDatabase() {
  // First, connect to the default 'postgres' database to create our database
  const adminClient = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    user: 'postgres', // Use postgres superuser to create database
    password: process.env.POSTGRES_PASSWORD || '', // You may need to set this
    database: 'postgres'
  });

  try {
    console.log('🔌 Connecting to PostgreSQL as postgres user...');
    await adminClient.connect();
    console.log('✅ Connected successfully');

    const dbName = process.env.DB_NAME || 'chessfi';
    const dbUser = process.env.DB_USER || 'lenaf';
    const dbPassword = process.env.DB_PASSWORD || '';

    // Check if database exists
    console.log(`\n📋 Checking if database '${dbName}' exists...`);
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (dbCheck.rows.length > 0) {
      console.log(`⚠️  Database '${dbName}' already exists`);
    } else {
      console.log(`🔧 Creating database '${dbName}'...`);
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    }

    // Check if user exists
    console.log(`\n📋 Checking if user '${dbUser}' exists...`);
    const userCheck = await adminClient.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [dbUser]
    );

    if (userCheck.rows.length > 0) {
      console.log(`⚠️  User '${dbUser}' already exists`);
      // Update password if user exists
      if (dbPassword) {
        console.log(`🔧 Updating password for user '${dbUser}'...`);
        await adminClient.query(`ALTER USER ${dbUser} WITH PASSWORD $1`, [dbPassword]);
        console.log(`✅ Password updated for user '${dbUser}'`);
      }
    } else {
      console.log(`🔧 Creating user '${dbUser}'...`);
      await adminClient.query(
        `CREATE USER ${dbUser} WITH PASSWORD $1`,
        [dbPassword]
      );
      console.log(`✅ User '${dbUser}' created successfully`);
    }

    // Grant privileges
    console.log(`\n🔧 Granting privileges to user '${dbUser}' on database '${dbName}'...`);
    await adminClient.query(`GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`);
    console.log(`✅ Privileges granted successfully`);

    await adminClient.end();

    // Now test connection with the new user
    console.log(`\n🧪 Testing connection with user '${dbUser}'...`);
    const testClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: dbUser,
      password: dbPassword,
      database: dbName
    });

    await testClient.connect();
    console.log('✅ Connection test successful!');
    await testClient.end();

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run database migrations: npm run setup-db');
    console.log('   2. Start the backend server: npm run dev');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    
    if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. You may need to:');
      console.error('   1. Set POSTGRES_PASSWORD in your .env file (password for postgres user)');
      console.error('   2. Or run this manually in psql:');
      console.error(`      CREATE USER ${process.env.DB_USER || 'lenaf'} WITH PASSWORD '${process.env.DB_PASSWORD || ''}';`);
      console.error(`      CREATE DATABASE ${process.env.DB_NAME || 'chessfi'} OWNER ${process.env.DB_USER || 'lenaf'};`);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Cannot connect to PostgreSQL. Make sure:');
      console.error('   1. PostgreSQL service is running');
      console.error('   2. Port 5432 is accessible');
    }
    
    process.exit(1);
  }
}

createDatabase();
