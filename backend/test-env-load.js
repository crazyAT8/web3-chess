const path = require('path');
const fs = require('fs');

console.log('Current directory:', __dirname);
console.log('.env file exists:', fs.existsSync(path.join(__dirname, '.env')));

// Try loading dotenv
const result = require('dotenv').config({ path: path.join(__dirname, '.env') });

if (result.error) {
  console.error('Error loading .env:', result.error);
} else {
  console.log('Loaded .env successfully');
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'not set');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_NAME:', process.env.DB_NAME);
}
