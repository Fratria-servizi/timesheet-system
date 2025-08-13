#!/usr/bin/env node

/**
 * Script semplificato per inizializzare il database SQLite
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Crea database SQLite
const dbPath = path.join(__dirname, '..', 'database', 'timesheet.db');
const db = new sqlite3.Database(dbPath);

console.log('🚀 Inizializzazione database SQLite...');
console.log('📁 Database path:', dbPath);

// Crea tabelle in modo sincrono
db.serialize(() => {
  console.log('📋 Creazione tabelle...');
  
  // Tabella utenti
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabella aziende
  db.run(`
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      vat_number TEXT UNIQUE,
      city TEXT,
      contact_email TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tabella funzionalità
  db.run(`
    CREATE TABLE IF NOT EXISTS features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      is_active INTEGER DEFAULT 1
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
      position TEXT,
      department TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log('✅ Tabelle create con successo');

  // Inserisci utenti di esempio (solo se non esistono)
  db.run(`INSERT OR IGNORE INTO users (username, email, password_hash, role, created_at) VALUES 
    ('admin', 'admin@timesheet.com', 'admin123', 'admin', datetime('now')),
    ('aziendaesempio', 'admin@aziendaesempio.it', 'company123', 'company', datetime('now')),
    ('emp001', 'emp001@timesheet.com', 'password123', 'employee', datetime('now'))
  `);

  console.log('✅ Utenti inseriti (o già esistenti)');

  // Inserisci dati di esempio
  console.log('📝 Inserimento dati di esempio...');

  // Funzionalità
  const features = [
    ['Login', 'login', 'Sistema di autenticazione'],
    ['Entrata/Uscita', 'time_tracking', 'Registrazione entrata e uscita'],
    ['Pausa', 'break', 'Gestione pause lavorative'],
    ['Ferie', 'vacation', 'Gestione ferie e permessi']
  ];

  features.forEach(feature => {
    db.run('INSERT OR IGNORE INTO features (name, code, description) VALUES (?, ?, ?)', feature);
  });

  // Utente admin
  bcrypt.hash('admin123', 12).then(hash => {
    db.run(`
      INSERT OR REPLACE INTO users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, ['admin', 'admin@timesheet.com', hash, 'admin']);
    console.log('✅ Utente admin creato (admin/admin123)');
  });

  // Azienda
  db.run(`
    INSERT OR REPLACE INTO companies (name, vat_number, city, contact_email)
    VALUES (?, ?, ?, ?)
  `, ['Azienda Esempio SRL', 'IT12345678901', 'Milano', 'info@aziendaesempio.it'], function() {
    const companyId = this.lastID;
    console.log('✅ Azienda esempio creata');

    // Dipendenti
    const employees = [
      ['EMP001', 'Mario', 'Rossi', 'mario.rossi@aziendaesempio.it', 'Sviluppatore', 'IT'],
      ['EMP002', 'Giulia', 'Bianchi', 'giulia.bianchi@aziendaesempio.it', 'Designer', 'Marketing'],
      ['EMP003', 'Luca', 'Verdi', 'luca.verdi@aziendaesempio.it', 'Project Manager', 'Management']
    ];

    let completed = 0;
    employees.forEach(emp => {
      db.run(`
        INSERT OR REPLACE INTO employees (company_id, employee_code, first_name, last_name, email, position, department)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [companyId, ...emp], function() {
        const empId = this.lastID;
        
        // Credenziali dipendente
        bcrypt.hash('password123', 12).then(hash => {
          db.run(`
            INSERT OR REPLACE INTO employee_credentials (employee_id, username, password_hash)
            VALUES (?, ?, ?)
          `, [empId, emp[0].toLowerCase(), hash]);
          
          completed++;
          if (completed === employees.length) {
            console.log('✅ 3 dipendenti creati (emp001/emp002/emp003, password: password123)');
            
            // Utente azienda
            bcrypt.hash('company123', 12).then(hash => {
              db.run(`
                INSERT OR REPLACE INTO users (username, email, password_hash, role)
                VALUES (?, ?, ?, ?)
              `, ['aziendaesempio', 'admin@aziendaesempio.it', hash, 'company']);
              console.log('✅ Utente azienda creato (aziendaesempio/company123)');
              
              // Presenze di esempio
              const currentDate = new Date();
              const currentMonth = currentDate.getMonth() + 1;
              const currentYear = currentDate.getFullYear();
              
              for (let day = 1; day <= 3; day++) {
                const recordDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                
                db.run(`
                  INSERT OR IGNORE INTO time_records (employee_id, record_date, record_type, time_value, notes)
                  VALUES (?, ?, ?, ?, ?)
                `, [1, recordDate, 'entry', '09:00', 'Entrata ufficio']);

                db.run(`
                  INSERT OR IGNORE INTO time_records (employee_id, record_date, record_type, time_value, notes)
                  VALUES (?, ?, ?, ?, ?)
                `, [1, recordDate, 'exit', '18:00', 'Uscita ufficio']);
              }
              console.log('✅ Presenze di esempio create');
              
              console.log('\n🎉 Database SQLite inizializzato con successo!');
              console.log('\n📋 Credenziali di accesso:');
              console.log('👑 Admin: username=admin, password=admin123');
              console.log('🏢 Azienda: username=aziendaesempio, password=company123');
              console.log('👤 Dipendenti: username=emp001/emp002/emp003, password=password123');
              console.log('\n💡 Puoi ora avviare le applicazioni e testare il sistema!');
              
              db.close();
            });
          }
        });
      });
    });
  });
}); 