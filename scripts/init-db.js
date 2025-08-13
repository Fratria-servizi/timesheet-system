#!/usr/bin/env node

/**
 * Script per inizializzare il database con dati di esempio
 * Uso: node scripts/init-db.js
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../backend/.env' });

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'timesheet',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Inizializzazione database...');
    
    // 1. Crea utente amministratore
    const adminPassword = await bcrypt.hash('admin123', 12);
    await client.query(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ('admin', 'admin@timesheet.com', $1, 'admin')
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email = EXCLUDED.email
    `, [adminPassword]);
    console.log('✅ Utente admin creato (username: admin, password: admin123)');

    // 2. Crea azienda di esempio
    const companyResult = await client.query(`
      INSERT INTO companies (name, vat_number, address, city, postal_code, country, contact_email, contact_phone)
      VALUES ('Azienda Esempio SRL', 'IT12345678901', 'Via Roma 123', 'Milano', '20100', 'Italia', 'info@aziendaesempio.it', '+39 02 1234567')
      ON CONFLICT (vat_number) DO UPDATE SET
        name = EXCLUDED.name,
        address = EXCLUDED.address,
        city = EXCLUDED.city
      RETURNING id
    `);
    const companyId = companyResult.rows[0].id;
    console.log('✅ Azienda esempio creata');

    // 3. Abilita funzionalità per l'azienda
    await client.query(`
      INSERT INTO company_features (company_id, feature_id, is_enabled)
      SELECT $1, id, true
      FROM features
      WHERE code IN ('login', 'time_tracking', 'break', 'vacation', 'sick')
      ON CONFLICT (company_id, feature_id) DO UPDATE SET
        is_enabled = EXCLUDED.is_enabled
    `, [companyId]);
    console.log('✅ Funzionalità abilitate per l\'azienda');

    // 4. Crea dipendenti di esempio
    const employees = [
      {
        code: 'EMP001',
        first_name: 'Mario',
        last_name: 'Rossi',
        email: 'mario.rossi@aziendaesempio.it',
        phone: '+39 333 1234567',
        position: 'Sviluppatore',
        department: 'IT',
        hire_date: '2023-01-15'
      },
      {
        code: 'EMP002',
        first_name: 'Giulia',
        last_name: 'Bianchi',
        email: 'giulia.bianchi@aziendaesempio.it',
        phone: '+39 333 2345678',
        position: 'Designer',
        department: 'Marketing',
        hire_date: '2023-02-01'
      },
      {
        code: 'EMP003',
        first_name: 'Luca',
        last_name: 'Verdi',
        email: 'luca.verdi@aziendaesempio.it',
        phone: '+39 333 3456789',
        position: 'Project Manager',
        department: 'Management',
        hire_date: '2023-01-01'
      }
    ];

    for (const emp of employees) {
      // Crea dipendente
      const empResult = await client.query(`
        INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, position, department, hire_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (company_id, employee_code) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email
        RETURNING id
      `, [companyId, emp.code, emp.first_name, emp.last_name, emp.email, emp.phone, emp.position, emp.department, emp.hire_date]);

      const empId = empResult.rows[0].id;

      // Crea credenziali (password di default: password123)
      const empPassword = await bcrypt.hash('password123', 12);
      await client.query(`
        INSERT INTO employee_credentials (employee_id, username, password_hash)
        VALUES ($1, $2, $3)
        ON CONFLICT (employee_id) DO UPDATE SET
          password_hash = EXCLUDED.password_hash
      `, [empId, emp.code.toLowerCase(), empPassword]);
    }
    console.log('✅ 3 dipendenti di esempio creati (password: password123)');

    // 5. Crea utente azienda
    const companyUserPassword = await bcrypt.hash('company123', 12);
    await client.query(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ('aziendaesempio', 'admin@aziendaesempio.it', $1, 'company')
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        email = EXCLUDED.email
    `, [companyUserPassword]);
    console.log('✅ Utente azienda creato (username: aziendaesempio, password: company123)');

    // 6. Crea alcune presenze di esempio per il mese corrente
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Presenze per Mario Rossi (EMP001)
    const marioId = await client.query('SELECT id FROM employees WHERE employee_code = $1', ['EMP001']);
    if (marioId.rows.length > 0) {
      const empId = marioId.rows[0].id;
      
      // Presenze per alcuni giorni del mese corrente
      for (let day = 1; day <= 5; day++) {
        const recordDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        
        // Entrata
        await client.query(`
          INSERT INTO time_records (employee_id, record_date, record_type, time_value, notes)
          VALUES ($1, $2, 'entry', '09:00', 'Entrata ufficio')
          ON CONFLICT DO NOTHING
        `, [empId, recordDate]);

        // Uscita
        await client.query(`
          INSERT INTO time_records (employee_id, record_date, record_type, time_value, notes)
          VALUES ($1, $2, 'exit', '18:00', 'Uscita ufficio')
          ON CONFLICT DO NOTHING
        `, [empId, recordDate]);

        // Pausa pranzo
        await client.query(`
          INSERT INTO time_records (employee_id, record_date, record_type, time_value, notes)
          VALUES ($1, $2, 'break_start', '12:30', 'Inizio pausa pranzo')
          ON CONFLICT DO NOTHING
        `, [empId, recordDate]);

        await client.query(`
          INSERT INTO time_records (employee_id, record_date, record_type, time_value, notes)
          VALUES ($1, $2, 'break_end', '13:30', 'Fine pausa pranzo')
          ON CONFLICT DO NOTHING
        `, [empId, recordDate]);
      }
      console.log('✅ Presenze di esempio create per Mario Rossi');
    }

    console.log('\n🎉 Database inizializzato con successo!');
    console.log('\n📋 Credenziali di accesso:');
    console.log('👑 Admin: username=admin, password=admin123');
    console.log('🏢 Azienda: username=aziendaesempio, password=company123');
    console.log('👤 Dipendenti: username=emp001/emp002/emp003, password=password123');
    console.log('\n💡 Puoi ora avviare le applicazioni e testare il sistema!');

  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Esegui se chiamato direttamente
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('✅ Script completato');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script fallito:', error);
      process.exit(1);
    });
}

module.exports = { initDatabase }; 