const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'timesheet',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test della connessione
pool.on('connect', () => {
  console.log('Connesso al database PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Errore database:', err);
  process.exit(-1);
});

module.exports = pool; 