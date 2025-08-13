#!/usr/bin/env node

/**
 * Script per inizializzare il database SQLite con dati di esempio
 * Uso: node scripts/init-sqlite.js
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Crea database SQLite
const dbPath = path.join(__dirname, '..', 'database', 'timesheet.db');
const db = new sqlite3.Database(dbPath);

async function initSQLiteDatabase() {
  try {
    console.log('🚀 Inizializzazione database SQLite...');
    
    // Crea tabelle
    await createTables();
    
    // Inserisci dati di esempio
    await insertSampleData();
    
    console.log('\n🎉 Database SQLite inizializzato con successo!');
    console.log('\n📋 Credenziali di accesso:');
    console.log('👑 Admin: username=admin, password=admin123');
    console.log('🏢 Azienda: username=aziendaesempio, password=company123');
    console.log('👤 Dipendenti: username=emp001/emp002/emp003, password=password123');
    console.log('\n💡 Puoi ora avviare le applicazioni e testare il sistema!');
    
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:', error);
    throw error;
  } finally {
    db.close();
  }
}

function createTables() {
  return new Promise((resolve, reject) => {
    console.log('📋 Creazione tabelle...');
    
    // Tabella utenti amministratori
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'admin',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella aziende
    db.run(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        vat_number TEXT UNIQUE,
        address TEXT,
        city TEXT,
        postal_code TEXT,
        country TEXT,
        contact_email TEXT,
        contact_phone TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabella funzionalità disponibili
    db.run(`
      CREATE TABLE IF NOT EXISTS features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        is_active INTEGER DEFAULT 1
      )
    `);

    // Tabella funzionalità abilitate per azienda
    db.run(`
      CREATE TABLE IF NOT EXISTS company_features (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        feature_id INTEGER,
        is_enabled INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies (id),
        FOREIGN KEY (feature_id) REFERENCES features (id),
        UNIQUE(company_id, feature_id)
      )
    `);

    // Tabella dipendenti
    db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER,
        employee_code TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        position TEXT,
        department TEXT,
        hire_date TEXT,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies (id),
        UNIQUE(company_id, employee_code)
      )
    `);

    // Tabella credenziali dipendenti
    db.run(`
      CREATE TABLE IF NOT EXISTS employee_credentials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        is_first_login INTEGER DEFAULT 1,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees (id)
      )
    `);

    // Tabella presenze
    db.run(`
      CREATE TABLE IF NOT EXISTS time_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        record_date TEXT NOT NULL,
        record_type TEXT NOT NULL,
        time_value TEXT,
        notes TEXT,
        is_approved INTEGER DEFAULT 0,
        approved_by INTEGER,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees (id),
        FOREIGN KEY (approved_by) REFERENCES users (id)
      )
    `);

    // Tabella permessi e ferie
    db.run(`
      CREATE TABLE IF NOT EXISTS leave_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER,
        leave_type TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        days_requested REAL,
        reason TEXT,
        status TEXT DEFAULT 'pending',
        approved_by INTEGER,
        approved_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees (id),
        FOREIGN KEY (approved_by) REFERENCES users (id)
      )
    `);

    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Tabelle create con successo');
        resolve();
      }
    });
  });
}

function insertSampleData() {
  return new Promise((resolve, reject) => {
    console.log('📝 Inserimento dati di esempio...');
    
    // Inserimento funzionalità predefinite
    const features = [
      ['Login', 'login', 'Sistema di autenticazione'],
      ['Calendario', 'calendar', 'Visualizzazione calendario presenze'],
      ['Entrata/Uscita', 'time_tracking', 'Registrazione entrata e uscita'],
      ['Pausa', 'break', 'Gestione pause lavorative'],
      ['Ferie', 'vacation', 'Gestione ferie e permessi'],
      ['Permessi', 'permit', 'Gestione permessi speciali'],
      ['Legge 104', 'law_104', 'Gestione permessi legge 104'],
      ['Malattia', 'sick', 'Gestione certificati di malattia']
    ];

    const insertFeature = db.prepare('INSERT OR IGNORE INTO features (name, code, description) VALUES (?, ?, ?)');
    features.forEach(feature => insertFeature.run(feature));
    insertFeature.finalize();

    // Inserimento utente amministratore
    bcrypt.hash('admin123', 12).then(hash => {
      db.run(`
        INSERT OR REPLACE INTO users (username, email, password_hash, role)
        VALUES (?, ?, ?, ?)
      `, ['admin', 'admin@timesheet.com', hash, 'admin']);
      console.log('✅ Utente admin creato');
    });

    // Inserimento azienda di esempio
    db.run(`
      INSERT OR REPLACE INTO companies (name, vat_number, address, city, postal_code, country, contact_email, contact_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, ['Azienda Esempio SRL', 'IT12345678901', 'Via Roma 123', 'Milano', '20100', 'Italia', 'info@aziendaesempio.it', '+39 02 1234567'], function() {
      const companyId = this.lastID;
      console.log('✅ Azienda esempio creata');

      // Abilita funzionalità per l'azienda
      db.run(`
        INSERT OR REPLACE INTO company_features (company_id, feature_id, is_enabled)
        SELECT ?, id, 1
        FROM features
        WHERE code IN ('login', 'time_tracking', 'break', 'vacation', 'sick')
      `, [companyId]);

      // Crea dipendenti di esempio
      const employees = [
        ['EMP001', 'Mario', 'Rossi', 'mario.rossi@aziendaesempio.it', '+39 333 1234567', 'Sviluppatore', 'IT', '2023-01-15'],
        ['EMP002', 'Giulia', 'Bianchi', 'giulia.bianchi@aziendaesempio.it', '+39 333 2345678', 'Designer', 'Marketing', '2023-02-01'],
        ['EMP003', 'Luca', 'Verdi', 'luca.verdi@aziendaesempio.it', '+39 333 3456789', 'Project Manager', 'Management', '2023-01-01']
      ];

      let completed = 0;
      employees.forEach((emp, index) => {
        db.run(`
          INSERT OR REPLACE INTO employees (company_id, employee_code, first_name, last_name, email, phone, position, department, hire_date)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [companyId, ...emp], function() {
          const empId = this.lastID;
          
          // Crea credenziali per il dipendente
          bcrypt.hash('password123', 12).then(hash => {
            db.run(`
              INSERT OR REPLACE INTO employee_credentials (employee_id, username, password_hash)
              VALUES (?, ?, ?)
            `, [empId, emp[0].toLowerCase(), hash]);
            
            completed++;
            if (completed === employees.length) {
              console.log('✅ Dipendenti di esempio creati');
              
              // Crea utente azienda
              bcrypt.hash('company123', 12).then(hash => {
                db.run(`
                  INSERT OR REPLACE INTO users (username, email, password_hash, role)
                  VALUES (?, ?, ?, ?)
                `, ['aziendaesempio', 'admin@aziendaesempio.it', hash, 'company']);
                console.log('✅ Utente azienda creato');
                
                // Crea alcune presenze di esempio
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth() + 1;
                const currentYear = currentDate.getFullYear();
                
                // Presenze per Mario Rossi (EMP001)
                const marioId = 1; // Primo dipendente inserito
                
                for (let day = 1; day <= 5; day++) {
                  const recordDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                  
                  // Entrata
                  db.run(`
                    INSERT OR IGNORE INTO time_records (employee_id, record_date, record_type, time_value, notes)
                    VALUES (?, ?, ?, ?, ?)
                  `, [marioId, recordDate, 'entry', '09:00', 'Entrata ufficio']);

                  // Uscita
                  db.run(`
                    INSERT OR IGNORE INTO time_records (employee_id, record_date, record_type, time_value, notes)
                    VALUES (?, ?, ?, ?, ?)
                  `, [marioId, recordDate, 'exit', '18:00', 'Uscita ufficio']);

                  // Pausa pranzo
                  db.run(`
                    INSERT OR IGNORE INTO time_records (employee_id, record_date, record_type, time_value, notes)
                    VALUES (?, ?, ?, ?, ?)
                  `, [marioId, recordDate, 'break_start', '12:30', 'Inizio pausa pranzo']);

                  db.run(`
                    INSERT OR IGNORE INTO time_records (employee_id, record_date, record_type, time_value, notes)
                    VALUES (?, ?, ?, ?, ?)
                  `, [marioId, recordDate, 'break_end', '13:30', 'Fine pausa pranzo']);
                }
                console.log('✅ Presenze di esempio create per Mario Rossi');
                resolve();
              });
            }
          });
        });
      });
    });
  });
}

// Esegui se chiamato direttamente
if (require.main === module) {
  initSQLiteDatabase()
    .then(() => {
      console.log('✅ Script completato');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script fallito:', error);
      process.exit(1);
    });
}

module.exports = { initSQLiteDatabase }; 