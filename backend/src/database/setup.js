require('dotenv').config();
const { migrate } = require('./migrate');
const { seed } = require('./seed');

async function setup() {
  try {
    console.log('🚀 Starting ChessFi database setup...');
    
    // Run migration first
    await migrate();
    
    // Then run seeding
    await seed();
    
    console.log('🎉 ChessFi database setup completed successfully!');
    console.log('📊 Database is ready for use with sample data.');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setup();
}

module.exports = { setup };
