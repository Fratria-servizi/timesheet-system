const { Pool } = require('pg');

// Configurazione database PostgreSQL per produzione
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connessione
pool.on('connect', () => {
  console.log('✅ Connesso al database PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Errore database PostgreSQL:', err);
});

// Wrapper per operazioni database con Promise
const query = (text, params) => pool.query(text, params);

const getClient = () => pool.connect();

const close = () => pool.end();

module.exports = {
  query,
  getClient,
  close,
  pool
}; 