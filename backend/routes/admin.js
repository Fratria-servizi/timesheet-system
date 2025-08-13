const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Middleware di autenticazione per tutte le route
router.use(authenticateToken);
router.use(requireRole(['admin']));

// Lista tutte le aziende
router.get('/companies', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, 
             COUNT(e.id) as employee_count,
             COUNT(cf.id) as enabled_features_count
      FROM companies c
      LEFT JOIN employees e ON c.id = e.company_id AND e.status = 'active'
      LEFT JOIN company_features cf ON c.id = cf.company_id AND cf.is_enabled = true
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero aziende:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Crea nuova azienda
router.post('/companies', [
  body('name').notEmpty().withMessage('Nome azienda richiesto'),
  body('vat_number').notEmpty().withMessage('Partita IVA richiesta'),
  body('contact_email').isEmail().withMessage('Email contatto non valida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name, vat_number, address, city, postal_code, country,
      contact_email, contact_phone
    } = req.body;

    // Verifica che la partita IVA non esista già
    const existingCompany = await pool.query(
      'SELECT id FROM companies WHERE vat_number = $1',
      [vat_number]
    );

    if (existingCompany.rows.length > 0) {
      return res.status(400).json({ error: 'Azienda con questa partita IVA già esistente' });
    }

    // Crea azienda
    const companyResult = await pool.query(`
      INSERT INTO companies (name, vat_number, address, city, postal_code, country, contact_email, contact_phone)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, vat_number, address, city, postal_code, country, contact_email, contact_phone]);

    const company = companyResult.rows[0];

    // Abilita funzionalità di default (login sempre abilitato)
    await pool.query(`
      INSERT INTO company_features (company_id, feature_id, is_enabled)
      SELECT $1, id, CASE WHEN code = 'login' THEN true ELSE false END
      FROM features
    `, [company.id]);

    res.status(201).json(company);
  } catch (error) {
    console.error('Errore creazione azienda:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Aggiorna azienda
router.put('/companies/:id', [
  body('name').notEmpty().withMessage('Nome azienda richiesto'),
  body('contact_email').isEmail().withMessage('Email contatto non valida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name, address, city, postal_code, country,
      contact_email, contact_phone, status
    } = req.body;

    const result = await pool.query(`
      UPDATE companies 
      SET name = $1, address = $2, city = $3, postal_code = $4, 
          country = $5, contact_email = $6, contact_phone = $7, 
          status = $8, updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `, [name, address, city, postal_code, country, contact_email, contact_phone, status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Azienda non trovata' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Errore aggiornamento azienda:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Gestione funzionalità azienda
router.get('/companies/:id/features', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(`
      SELECT f.*, cf.is_enabled
      FROM features f
      LEFT JOIN company_features cf ON f.id = cf.feature_id AND cf.company_id = $1
      WHERE f.is_active = true
      ORDER BY f.name
    `, [id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Errore recupero funzionalità:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Aggiorna funzionalità azienda
router.put('/companies/:id/features', async (req, res) => {
  try {
    const { id } = req.params;
    const { features } = req.body; // Array di { feature_id, is_enabled }

    // Aggiorna tutte le funzionalità
    for (const feature of features) {
      await pool.query(`
        INSERT INTO company_features (company_id, feature_id, is_enabled)
        VALUES ($1, $2, $3)
        ON CONFLICT (company_id, feature_id)
        DO UPDATE SET is_enabled = $3
      `, [id, feature.feature_id, feature.is_enabled]);
    }

    res.json({ message: 'Funzionalità aggiornate con successo' });
  } catch (error) {
    console.error('Errore aggiornamento funzionalità:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Crea credenziali per referente azienda
router.post('/companies/:id/company-user', [
  body('username').notEmpty().withMessage('Username richiesto'),
  body('password').isLength({ min: 6 }).withMessage('Password deve essere di almeno 6 caratteri'),
  body('email').isEmail().withMessage('Email non valida')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { username, password, email } = req.body;

    // Verifica che l'azienda esista
    const companyResult = await pool.query(
      'SELECT id FROM companies WHERE id = $1',
      [id]
    );

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Azienda non trovata' });
    }

    // Verifica che username non esista già
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Username già esistente' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crea utente azienda
    const userResult = await pool.query(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, 'company')
      RETURNING id, username, email, role
    `, [username, email, hashedPassword]);

    res.status(201).json(userResult.rows[0]);
  } catch (error) {
    console.error('Errore creazione utente azienda:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Statistiche sistema
router.get('/stats', async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM companies WHERE status = 'active') as active_companies,
        (SELECT COUNT(*) FROM employees WHERE status = 'active') as total_employees,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
        (SELECT COUNT(*) FROM users WHERE role = 'company') as company_users
    `);

    res.json(stats.rows[0]);
  } catch (error) {
    console.error('Errore recupero statistiche:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router; 