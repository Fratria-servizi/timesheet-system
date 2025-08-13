const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateEmployee } = require('../middleware/auth');

const router = express.Router();

// Middleware di autenticazione per tutte le route
router.use(authenticateEmployee);

// Informazioni dipendente corrente
router.get('/profile', async (req, res) => {
  try {
    const employeeId = req.employee.employee_id;

    const result = await pool.query(`
      SELECT e.*, c.name as company_name
      FROM employees e
      JOIN companies c ON e.company_id = c.id
      WHERE e.id = $1
    `, [employeeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Dipendente non trovato' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore recupero profilo:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Funzionalità abilitate per l'azienda
router.get('/features', async (req, res) => {
  try {
    const companyId = req.employee.company_id;

    const result = await pool.query(`
      SELECT f.*
      FROM features f
      JOIN company_features cf ON f.id = cf.feature_id
      WHERE cf.company_id = $1 AND cf.is_enabled = true AND f.is_active = true
      ORDER BY f.name
    `, [companyId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero funzionalità:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Presenze del giorno corrente
router.get('/today-records', async (req, res) => {
  try {
    const employeeId = req.employee.employee_id;
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(`
      SELECT * FROM time_records
      WHERE employee_id = $1 AND record_date = $2
      ORDER BY time_value
    `, [employeeId, today]);

    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero presenze oggi:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Registra entrata
router.post('/entry', [
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato ora non valido (HH:MM)'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Note troppo lunghe')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employeeId = req.employee.employee_id;
    const { time, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Verifica che non ci sia già un'entrata per oggi
    const existingEntry = await pool.query(`
      SELECT id FROM time_records 
      WHERE employee_id = $1 AND record_date = $2 AND record_type = 'entry'
    `, [employeeId, today]);

    if (existingEntry.rows.length > 0) {
      return res.status(400).json({ error: 'Entrata già registrata per oggi' });
    }

    // Registra entrata
    const result = await pool.query(`
      INSERT INTO time_records (employee_id, record_date, record_type, time_value, notes)
      VALUES ($1, $2, 'entry', $3, $4)
      RETURNING *
    `, [employeeId, today, time, notes]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore registrazione entrata:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Registra uscita
router.post('/exit', [
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato ora non valido (HH:MM)'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Note troppo lunghe')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employeeId = req.employee.employee_id;
    const { time, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Verifica che ci sia un'entrata per oggi
    const existingEntry = await pool.query(`
      SELECT id FROM time_records 
      WHERE employee_id = $1 AND record_date = $2 AND record_type = 'entry'
    `, [employeeId, today]);

    if (existingEntry.rows.length === 0) {
      return res.status(400).json({ error: 'Devi prima registrare un\'entrata' });
    }

    // Verifica che non ci sia già un'uscita per oggi
    const existingExit = await pool.query(`
      SELECT id FROM time_records 
      WHERE employee_id = $1 AND record_date = $2 AND record_type = 'exit'
    `, [employeeId, today]);

    if (existingExit.rows.length > 0) {
      return res.status(400).json({ error: 'Uscita già registrata per oggi' });
    }

    // Registra uscita
    const result = await pool.query(`
      INSERT INTO time_records (employee_id, record_date, record_type, time_value, notes)
      VALUES ($1, $2, 'exit', $3, $4)
      RETURNING *
    `, [employeeId, today, time, notes]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore registrazione uscita:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Registra inizio pausa
router.post('/break-start', [
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato ora non valido (HH:MM)'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Note troppo lunghe')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employeeId = req.employee.employee_id;
    const { time, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Verifica che non ci sia già una pausa iniziata per oggi
    const existingBreak = await pool.query(`
      SELECT id FROM time_records 
      WHERE employee_id = $1 AND record_date = $2 AND record_type = 'break_start'
    `, [employeeId, today]);

    if (existingBreak.rows.length > 0) {
      return res.status(400).json({ error: 'Pausa già iniziata per oggi' });
    }

    // Registra inizio pausa
    const result = await pool.query(`
      INSERT INTO time_records (employee_id, record_date, record_type, time_value, notes)
      VALUES ($1, $2, 'break_start', $3, $4)
      RETURNING *
    `, [employeeId, today, time, notes]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore registrazione inizio pausa:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Registra fine pausa
router.post('/break-end', [
  body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Formato ora non valido (HH:MM)'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Note troppo lunghe')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employeeId = req.employee.employee_id;
    const { time, notes } = req.body;
    const today = new Date().toISOString().split('T')[0];

    // Verifica che ci sia una pausa iniziata per oggi
    const existingBreak = await pool.query(`
      SELECT id FROM time_records 
      WHERE employee_id = $1 AND record_date = $2 AND record_type = 'break_start'
    `, [employeeId, today]);

    if (existingBreak.rows.length === 0) {
      return res.status(400).json({ error: 'Devi prima iniziare una pausa' });
    }

    // Verifica che non ci sia già una fine pausa per oggi
    const existingBreakEnd = await pool.query(`
      SELECT id FROM time_records 
      WHERE employee_id = $1 AND record_date = $2 AND record_type = 'break_end'
    `, [employeeId, today]);

    if (existingBreakEnd.rows.length > 0) {
      return res.status(400).json({ error: 'Pausa già terminata per oggi' });
    }

    // Registra fine pausa
    const result = await pool.query(`
      INSERT INTO time_records (employee_id, record_date, record_type, time_value, notes)
      VALUES ($1, $2, 'break_end', $3, $4)
      RETURNING *
    `, [employeeId, today, time, notes]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore registrazione fine pausa:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Richiesta permesso/ferie
router.post('/leave-request', [
  body('leave_type').isIn(['vacation', 'sick', 'permit', '104']).withMessage('Tipo permesso non valido'),
  body('start_date').isISO8601().withMessage('Data inizio non valida'),
  body('end_date').isISO8601().withMessage('Data fine non valida'),
  body('reason').notEmpty().withMessage('Motivo richiesto')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employeeId = req.employee.employee_id;
    const { leave_type, start_date, end_date, reason } = req.body;

    // Verifica che la data di fine non sia precedente all'inizio
    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'La data di fine non può essere precedente all\'inizio' });
    }

    // Calcola giorni richiesti
    const start = new Date(start_date);
    const end = new Date(end_date);
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Crea richiesta
    const result = await pool.query(`
      INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, days_requested, reason)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [employeeId, leave_type, start_date, end_date, daysDiff, reason]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Errore creazione richiesta permesso:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Storico presenze (solo lettura)
router.get('/time-records/:year/:month', async (req, res) => {
  try {
    const employeeId = req.employee.employee_id;
    const { year, month } = req.params;

    const result = await pool.query(`
      SELECT * FROM time_records
      WHERE employee_id = $1 
        AND EXTRACT(YEAR FROM record_date) = $2
        AND EXTRACT(MONTH FROM record_date) = $3
      ORDER BY record_date, time_value
    `, [employeeId, year, month]);

    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero storico presenze:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Storico richieste permessi
router.get('/leave-requests', async (req, res) => {
  try {
    const employeeId = req.employee.employee_id;

    const result = await pool.query(`
      SELECT * FROM leave_requests
      WHERE employee_id = $1
      ORDER BY created_at DESC
    `, [employeeId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero richieste permessi:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router; 