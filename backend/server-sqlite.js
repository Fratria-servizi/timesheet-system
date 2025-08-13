const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Inizializzazione automatica del database
async function initializeDatabase() {
  try {
    console.log('🚀 Inizializzazione database SQLite...');
    const db = require('./config/sqlite');
    
    // Crea tabelle se non esistono
    await db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        address TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL,
        employee_code TEXT UNIQUE NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        position TEXT,
        department TEXT,
        hire_date DATE,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (company_id) REFERENCES companies (id)
      )
    `);
    
    await db.run(`
      CREATE TABLE IF NOT EXISTS time_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employee_id INTEGER NOT NULL,
        record_date DATE NOT NULL,
        record_type TEXT NOT NULL,
        time_value TIME NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees (id)
      )
    `);
    
    // Inserisci utente admin se non esiste
    const adminExists = await db.get('SELECT id FROM users WHERE username = ?', ['admin']);
    if (!adminExists) {
      await db.run(`
        INSERT INTO users (username, email, password_hash, role) 
        VALUES (?, ?, ?, ?)
      `, ['admin', 'admin@timesheet.com', 'admin123', 'admin']);
      console.log('✅ Utente admin creato');
    }
    
    // Inserisci azienda di esempio se non esiste
    const companyExists = await db.get('SELECT id FROM companies WHERE email = ?', ['admin@aziendaesempio.it']);
    if (!companyExists) {
      const companyResult = await db.run(`
        INSERT INTO companies (name, email, address, phone) 
        VALUES (?, ?, ?, ?)
      `, ['Azienda Esempio', 'admin@aziendaesempio.it', 'Via Roma 123, Milano', '+39 02 1234567']);
      
      // Inserisci utente azienda
      await db.run(`
        INSERT INTO users (username, email, password_hash, role) 
        VALUES (?, ?, ?, ?)
      `, ['aziendaesempio', 'admin@aziendaesempio.it', 'company123', 'company']);
      
      // Inserisci dipendenti di esempio
      await db.run(`
        INSERT INTO employees (company_id, employee_code, first_name, last_name, email, position, department) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [companyResult.id, 'EMP001', 'Mario', 'Rossi', 'mario.rossi@timesheet.com', 'Sviluppatore', 'IT']);
      
      console.log('✅ Azienda e dipendenti di esempio creati');
    }
    
    console.log('🎉 Database SQLite inizializzato con successo!');
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione del database:', error);
  }
}

// Inizializza il database all'avvio
initializeDatabase();

// Middleware di sicurezza
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 100, // limite per IP
  message: 'Troppe richieste da questo IP, riprova più tardi.'
});
app.use('/api/', limiter);

// CORS
app.use(cors({
  origin: true, // Permette tutti gli origin per ora
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Test endpoint per verificare il database
app.get('/api/test', async (req, res) => {
  try {
    const db = require('./config/sqlite');
    const users = await db.get('SELECT COUNT(*) as count FROM users');
    const companies = await db.get('SELECT COUNT(*) as count FROM companies');
    const employees = await db.get('SELECT COUNT(*) as count FROM employees');
    
    res.json({ 
      message: 'Database SQLite funziona!', 
      usersCount: users.count,
      companiesCount: companies.count,
      employeesCount: employees.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Errore database', details: error.message });
  }
});

// Endpoint per forzare l'inizializzazione del database
app.post('/api/init-db', async (req, res) => {
  try {
    console.log('🔄 Inizializzazione database forzata...');
    await initializeDatabase();
    res.json({ message: 'Database inizializzato con successo' });
  } catch (error) {
    console.error('❌ Errore inizializzazione forzata:', error);
    res.status(500).json({ error: 'Errore inizializzazione', details: error.message });
  }
});

// Endpoint di login semplificato per test
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = require('./config/sqlite');
    
    // Verifica credenziali
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    
    // Per ora, password semplice per test
    if (password === 'admin123') {
      res.json({
        token: 'test-token-' + Date.now(),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ error: 'Credenziali non valide' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint di login per company
app.post('/api/auth/company/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = require('./config/sqlite');
    
    // Verifica credenziali company
    const user = await db.get('SELECT * FROM users WHERE username = ? AND role = "company"', [username]);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    
    // Per ora, password semplice per test
    if (password === 'company123') {
      res.json({
        token: 'company-token-' + Date.now(),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } else {
      res.status(401).json({ error: 'Credenziali non valide' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint di login per employee
app.post('/api/auth/employee/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const db = require('./config/sqlite');
    
    // Verifica credenziali employee
    const user = await db.get('SELECT * FROM users WHERE username = ? AND role = "employee"', [username]);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }
    
    // Per ora, password semplice per test
    if (password === 'password123') {
      res.json({
        token: 'employee-token-' + Date.now(),
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          isFirstLogin: false // TODO: Implementa logica primo login
        }
      });
    } else {
      res.status(401).json({ error: 'Credenziali non valide' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint per cambio password employee
app.post('/api/auth/employee/change-password', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token mancante' });
    }
    
    // TODO: Verifica token e aggiorna password nel database
    res.json({ success: true, message: 'Password aggiornata con successo' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore interno del server' });
  }
});

// Endpoint per time tracking
app.post('/api/employee/time-entry', async (req, res) => {
  try {
    const { action } = req.body; // 'entry', 'exit', 'break'
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token mancante' });
    }
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('it-IT', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    // TODO: Salva nel database
    res.json({ 
      success: true, 
      action,
      timestamp: now.toISOString(),
      time: timeString,
      message: `${action === 'entry' ? 'Entrata' : action === 'exit' ? 'Uscita' : 'Pausa'} registrata alle ${timeString}`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore interno del server' });
  }
});

// Endpoint per ottenere time records
app.get('/api/employee/time-records', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token mancante' });
    }
    
    // TODO: Recupera dal database
    const timeRecords = [
      { id: 1, date: '2025-08-13', entry: '09:00', exit: '18:00', breaks: '1h', total: '8h', status: 'Completo' },
      { id: 2, date: '2025-08-12', entry: '08:30', exit: '17:30', breaks: '1h', total: '8h', status: 'Completo' },
      { id: 3, date: '2025-08-11', entry: '09:15', exit: '18:15', breaks: '1h', total: '8h', status: 'Completo' }
    ];
    
    res.json({ success: true, records: timeRecords });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore interno del server' });
  }
});

// Endpoint per richieste ferie
app.post('/api/employee/leave-request', async (req, res) => {
  try {
    const { type, startDate, endDate, reason, days } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token mancante' });
    }
    
    // TODO: Salva nel database
    res.json({ 
      success: true, 
      message: 'Richiesta creata con successo',
      request: { type, startDate, endDate, reason, days, status: 'In Attesa' }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore interno del server' });
  }
});

// Endpoint per ottenere richieste ferie
app.get('/api/employee/leave-requests', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token mancante' });
    }
    
    // TODO: Recupera dal database
    const leaveRequests = [
      { id: 1, type: 'Ferie', startDate: '2025-09-01', endDate: '2025-09-05', days: 5, reason: 'Vacanze estive', status: 'Approvata' },
      { id: 2, type: 'Permesso', startDate: '2025-08-20', endDate: '2025-08-20', days: 1, reason: 'Visita medica', status: 'In Attesa' },
      { id: 3, type: 'Malattia', startDate: '2025-08-15', endDate: '2025-08-16', days: 2, reason: 'Influenza', status: 'Approvata' }
    ];
    
    res.json({ success: true, requests: leaveRequests });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore interno del server' });
  }
});

// Endpoint per dashboard employee
app.get('/api/employee/dashboard', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token mancante' });
    }
    
    // TODO: Calcola statistiche reali dal database
    const dashboardData = {
      todayHours: '6.5',
      weekHours: '32.5',
      monthHours: '140',
      currentStatus: 'In Ufficio',
      lastEntry: '09:00',
      lastExit: null
    };
    
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Errore interno del server' });
  }
});

// Endpoint per aziende
app.get('/api/admin/companies', async (req, res) => {
  try {
    const db = require('./config/sqlite');
    const companies = await db.query(`
      SELECT c.*, 
             (SELECT COUNT(*) FROM employees e WHERE e.company_id = c.id AND e.status = 'active') as employee_count,
             (SELECT COUNT(*) FROM company_features cf WHERE cf.company_id = c.id AND cf.is_enabled = 1) as enabled_features_count
      FROM companies c
      ORDER BY c.created_at DESC
    `);
    
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint per verificare token
app.get('/api/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, error: 'Token mancante' });
    }
    
    const token = authHeader.substring(7);
    
    // Per ora, restituisce sempre valido per semplificare
    // In produzione, dovresti verificare il token JWT
    if (token.startsWith('test-token-')) {
      res.json({ 
        valid: true, 
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@timesheet.com',
          role: 'admin'
        }
      });
    } else if (token.startsWith('company-token-')) {
      res.json({ 
        valid: true, 
        user: {
          id: 2,
          username: 'aziendaesempio',
          email: 'azienda@timesheet.com',
          role: 'company'
        }
      });
    } else if (token.startsWith('employee-token-')) {
      res.json({ 
        valid: true, 
        user: {
          id: 3,
          username: 'emp001',
          email: 'emp001@timesheet.com',
          role: 'employee',
          isFirstLogin: false
        }
      });
    } else {
      res.status(401).json({ valid: false, error: 'Token non valido' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Endpoint per statistiche
app.get('/api/admin/stats', async (req, res) => {
  try {
    const db = require('./config/sqlite');
    const stats = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM companies WHERE status = 'active') as active_companies,
        (SELECT COUNT(*) FROM employees WHERE status = 'active') as total_employees,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
        (SELECT COUNT(*) FROM users WHERE role = 'company') as company_users
    `);
    
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint non trovato' });
});

// Error handler globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Errore interno del server',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Errore interno'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server SQLite avviato sulla porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test API: http://localhost:${PORT}/api/test`);
}); 