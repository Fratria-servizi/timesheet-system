const express = require('express');
const bcrypt = require('bcryptjs');
const ExcelJS = require('exceljs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware di autenticazione per tutte le route
router.use(authenticateToken);
router.use(requireRole(['company']));

// Informazioni azienda corrente
router.get('/info', async (req, res) => {
  try {
    // Per ora restituisce info utente, in futuro si può collegare all'azienda
    res.json({
      user: req.user,
      message: 'Endpoint per info azienda da implementare'
    });
  } catch (error) {
    console.error('Errore recupero info azienda:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Lista dipendenti dell'azienda
router.get('/employees', async (req, res) => {
  try {
    // TODO: Implementare logica per recuperare company_id dall'utente loggato
    const companyId = req.user.company_id || 1; // Placeholder

    const result = await pool.query(`
      SELECT e.*, ec.username, ec.is_first_login, ec.last_login
      FROM employees e
      LEFT JOIN employee_credentials ec ON e.id = ec.employee_id
      WHERE e.company_id = $1 AND e.status = 'active'
      ORDER BY e.last_name, e.first_name
    `, [companyId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero dipendenti:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Crea nuovo dipendente
router.post('/employees', [
  body('employee_code').notEmpty().withMessage('Codice dipendente richiesto'),
  body('first_name').notEmpty().withMessage('Nome richiesto'),
  body('last_name').notEmpty().withMessage('Cognome richiesto'),
  body('username').notEmpty().withMessage('Username richiesto'),
  body('password').isLength({ min: 6 }).withMessage('Password deve essere di almeno 6 caratteri')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      employee_code, first_name, last_name, email, phone,
      position, department, hire_date, username, password
    } = req.body;

    // TODO: Implementare logica per recuperare company_id dall'utente loggato
    const companyId = req.user.company_id || 1; // Placeholder

    // Verifica che il codice dipendente non esista già per questa azienda
    const existingEmployee = await pool.query(
      'SELECT id FROM employees WHERE company_id = $1 AND employee_code = $2',
      [companyId, employee_code]
    );

    if (existingEmployee.rows.length > 0) {
      return res.status(400).json({ error: 'Codice dipendente già esistente per questa azienda' });
    }

    // Verifica che username non esista già
    const existingUsername = await pool.query(
      'SELECT id FROM employee_credentials WHERE username = $1',
      [username]
    );

    if (existingUsername.rows.length > 0) {
      return res.status(400).json({ error: 'Username già esistente' });
    }

    // Inizia transazione
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Crea dipendente
      const employeeResult = await client.query(`
        INSERT INTO employees (company_id, employee_code, first_name, last_name, email, phone, position, department, hire_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `, [companyId, employee_code, first_name, last_name, email, phone, position, department, hire_date]);

      const employee = employeeResult.rows[0];

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Crea credenziali
      await client.query(`
        INSERT INTO employee_credentials (employee_id, username, password_hash)
        VALUES ($1, $2, $3)
      `, [employee.id, username, hashedPassword]);

      await client.query('COMMIT');

      res.status(201).json(employee);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Errore creazione dipendente:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Aggiorna dipendente
router.put('/employees/:id', [
  body('first_name').notEmpty().withMessage('Nome richiesto'),
  body('last_name').notEmpty().withMessage('Cognome richiesto')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      first_name, last_name, email, phone, position, department, status
    } = req.body;

    // TODO: Verificare che il dipendente appartenga all'azienda dell'utente loggato
    const result = await pool.query(`
      UPDATE employees 
      SET first_name = $1, last_name = $2, email = $3, phone = $4, 
          position = $5, department = $6, status = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `, [first_name, last_name, email, phone, position, department, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dipendente non trovato' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore aggiornamento dipendente:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Presenze dipendenti per mese
router.get('/employees/:id/time-records/:year/:month', async (req, res) => {
  try {
    const { id, year, month } = req.params;

    const result = await pool.query(`
      SELECT tr.*, e.first_name, e.last_name
      FROM time_records tr
      JOIN employees e ON tr.employee_id = e.id
      WHERE tr.employee_id = $1 
        AND EXTRACT(YEAR FROM tr.record_date) = $2
        AND EXTRACT(MONTH FROM tr.record_date) = $3
      ORDER BY tr.record_date, tr.time_value
    `, [id, year, month]);

    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero presenze:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Export Excel presenze mensili
router.get('/export-excel/:year/:month', async (req, res) => {
  try {
    const { year, month } = req.params;
    
    // TODO: Implementare logica per recuperare company_id dall'utente loggato
    const companyId = req.user.company_id || 1; // Placeholder

    // Recupera presenze per il mese
    const recordsResult = await pool.query(`
      SELECT 
        e.employee_code,
        e.first_name,
        e.last_name,
        e.department,
        tr.record_date,
        tr.record_type,
        tr.time_value,
        tr.notes
      FROM time_records tr
      JOIN employees e ON tr.employee_id = e.id
      WHERE e.company_id = $1 
        AND EXTRACT(YEAR FROM tr.record_date) = $2
        AND EXTRACT(MONTH FROM tr.record_date) = $3
      ORDER BY e.last_name, e.first_name, tr.record_date, tr.time_value
    `, [companyId, year, month]);

    // Crea workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Presenze Mensili');

    // Intestazioni
    worksheet.columns = [
      { header: 'Codice', key: 'employee_code', width: 15 },
      { header: 'Nome', key: 'first_name', width: 20 },
      { header: 'Cognome', key: 'last_name', width: 20 },
      { header: 'Reparto', key: 'department', width: 20 },
      { header: 'Data', key: 'record_date', width: 15 },
      { header: 'Tipo', key: 'record_type', width: 15 },
      { header: 'Ora', key: 'time_value', width: 15 },
      { header: 'Note', key: 'notes', width: 30 }
    ];

    // Stile intestazioni
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Dati
    recordsResult.rows.forEach(record => {
      worksheet.addRow({
        employee_code: record.employee_code,
        first_name: record.first_name,
        last_name: record.last_name,
        department: record.department,
        record_date: record.record_date,
        record_type: record.record_type,
        time_value: record.time_value,
        notes: record.notes || ''
      });
    });

    // Nome file
    const fileName = `presenze_${year}_${month.padStart(2, '0')}.xlsx`;

    // Imposta headers per download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    // Invia file
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Errore export Excel:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Statistiche azienda
router.get('/stats', async (req, res) => {
  try {
    // TODO: Implementare logica per recuperare company_id dall'utente loggato
    const companyId = req.user.company_id || 1; // Placeholder

    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM employees WHERE company_id = $1 AND status = 'active') as total_employees,
        (SELECT COUNT(*) FROM time_records tr 
         JOIN employees e ON tr.employee_id = e.id 
         WHERE e.company_id = $1 AND tr.record_date = CURRENT_DATE) as today_records,
        (SELECT COUNT(*) FROM leave_requests lr 
         JOIN employees e ON lr.employee_id = e.id 
         WHERE e.company_id = $1 AND lr.status = 'pending') as pending_requests
    `, [companyId]);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Errore recupero statistiche:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router; 