const { Sequelize } = require('sequelize');

// Use SQLite for development if no PostgreSQL is configured
const useSQLite = process.env.NODE_ENV === 'development' && !process.env.DB_HOST;

let sequelize;

if (useSQLite) {
  console.log('🔧 Using SQLite for development');
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './chessfi-dev.sqlite',
    logging: console.log,
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true
    }
  });
} else {
  console.log('🔧 Using PostgreSQL');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'chessfi',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'password',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true,
        freezeTableName: true
      }
    }
  );
}

module.exports = { sequelize }; 