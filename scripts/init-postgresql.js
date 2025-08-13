#!/usr/bin/env node

const { Pool } = require('pg');
require('dotenv').config();

console.log('🚀 Inizializzazione database PostgreSQL...');

// Verifica variabili d'ambiente
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non configurata');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function initDatabase() {
  try {
    console.log('📋 Creazione tabelle...');
    
    // Crea tabella users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'company', 'employee')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crea tabella companies
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        address TEXT,
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crea tabella features
    await pool.query(`
      CREATE TABLE IF NOT EXISTS features (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crea tabella company_features
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_features (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        feature_id INTEGER REFERENCES features(id) ON DELETE CASCADE,
        enabled BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(company_id, feature_id)
      )
    `);

    // Crea tabella employees
    await pool.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        position VARCHAR(100),
        department VARCHAR(100),
        hire_date DATE,
        salary DECIMAL(10,2),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crea tabella time_records
    await pool.query(`
      CREATE TABLE IF NOT EXISTS time_records (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        date DATE NOT NULL,
        entry_time TIME,
        exit_time TIME,
        break_duration INTEGER DEFAULT 0,
        total_hours DECIMAL(4,2),
        status VARCHAR(20) DEFAULT 'incomplete',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crea tabella leave_requests
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES employees(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days INTEGER NOT NULL,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Tabelle create con successo');

    // Inserisci features di default
    console.log('📝 Inserimento features di default...');
    await pool.query(`
      INSERT INTO features (name, description) VALUES 
        ('time_tracking', 'Registrazione entrata/uscita'),
        ('breaks', 'Gestione pause'),
        ('leave_requests', 'Richieste ferie e permessi'),
        ('reports', 'Report e analisi'),
        ('excel_export', 'Export Excel')
      ON CONFLICT (name) DO NOTHING
    `);

    // Inserisci utente admin di default
    console.log('📝 Inserimento utente admin...');
    const bcrypt = require('bcryptjs');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    
    await pool.query(`
      INSERT INTO users (username, email, password_hash, role) VALUES 
        ('admin', 'admin@timesheet.com', $1, 'admin')
      ON CONFLICT (username) DO NOTHING
    `, [adminPasswordHash]);

    // Inserisci azienda di esempio
    console.log('📝 Inserimento azienda di esempio...');
    const companyResult = await pool.query(`
      INSERT INTO companies (name, email, address, phone) VALUES 
        ('Azienda Esempio', 'admin@aziendaesempio.it', 'Via Roma 123, Milano', '+39 02 1234567')
      ON CONFLICT (email) DO NOTHING RETURNING id
    `);

    if (companyResult.rows.length > 0) {
      const companyId = companyResult.rows[0].id;
      
      // Inserisci utente azienda
      const companyPasswordHash = await bcrypt.hash('company123', 10);
      await pool.query(`
        INSERT INTO users (username, email, password_hash, role) VALUES 
          ('aziendaesempio', 'admin@aziendaesempio.it', $1, 'company')
        ON CONFLICT (username) DO NOTHING
      `, [companyPasswordHash]);

      // Abilita tutte le features per l'azienda
      await pool.query(`
        INSERT INTO company_features (company_id, feature_id, enabled) 
        SELECT $1, id, true FROM features
        ON CONFLICT (company_id, feature_id) DO UPDATE SET enabled = true
      `, [companyId]);

      // Inserisci dipendenti di esempio
      const employeePasswordHash = await bcrypt.hash('password123', 10);
      
      // Crea utenti dipendenti
      const employeeUsers = await pool.query(`
        INSERT INTO users (username, email, password_hash, role) VALUES 
          ('emp001', 'emp001@timesheet.com', $1, 'employee'),
          ('emp002', 'emp002@timesheet.com', $1, 'employee'),
          ('emp003', 'emp003@timesheet.com', $1, 'employee')
        ON CONFLICT (username) DO NOTHING RETURNING id, username
      `, [employeePasswordHash]);

      // Crea dipendenti
      for (const user of employeeUsers.rows) {
        await pool.query(`
          INSERT INTO employees (company_id, user_id, first_name, last_name, email, position, department, hire_date) VALUES 
            ($1, $2, 'Mario', 'Rossi', $3, 'Sviluppatore', 'IT', '2024-01-15')
          ON CONFLICT (user_id) DO NOTHING
        `, [companyId, user.id, user.username + '@timesheet.com']);
      }
    }

    console.log('✅ Dati di esempio inseriti');

    console.log('\n🎉 Database PostgreSQL inizializzato con successo!');
    console.log('\n📋 Credenziali di accesso:');
    console.log('👑 Admin: username=admin, password=admin123');
    console.log('🏢 Azienda: username=aziendaesempio, password=company123');
    console.log('👤 Dipendenti: username=emp001/emp002/emp003, password=password123');

  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:', error);
  } finally {
    await pool.end();
  }
}

initDatabase(); 