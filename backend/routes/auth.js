const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Login amministratore
router.post('/admin/login', [
  body('username').notEmpty().withMessage('Username richiesto'),
  body('password').notEmpty().withMessage('Password richiesta')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Verifica credenziali admin
    const userResult = await pool.query(
      'SELECT id, username, email, password_hash, role FROM users WHERE username = $1',
      [username]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const user = userResult.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Genera JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Errore login admin:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Login dipendente
router.post('/employee/login', [
  body('username').notEmpty().withMessage('Username richiesto'),
  body('password').notEmpty().withMessage('Password richiesta')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Verifica credenziali dipendente
    const employeeResult = await pool.query(`
      SELECT ec.id, ec.employee_id, ec.password_hash, ec.is_first_login,
             e.first_name, e.last_name, e.company_id, e.status
      FROM employee_credentials ec
      JOIN employees e ON ec.employee_id = e.id
      WHERE ec.username = $1 AND e.status = 'active'
    `, [username]);

    if (employeeResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const employee = employeeResult.rows[0];
    const isValidPassword = await bcrypt.compare(password, employee.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    // Aggiorna ultimo login
    await pool.query(
      'UPDATE employee_credentials SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [employee.id]
    );

    // Genera JWT token
    const token = jwt.sign(
      { employeeId: employee.id, companyId: employee.company_id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      employee: {
        id: employee.id,
        employeeId: employee.employee_id,
        firstName: employee.first_name,
        lastName: employee.last_name,
        companyId: employee.company_id,
        isFirstLogin: employee.is_first_login
      }
    });
  } catch (error) {
    console.error('Errore login dipendente:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Cambio password primo accesso dipendente
router.post('/employee/change-password', [
  body('newPassword').isLength({ min: 6 }).withMessage('Password deve essere di almeno 6 caratteri'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Le password non coincidono');
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token richiesto' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    const { employeeId } = decoded;

    // Verifica che sia il primo login
    const employeeResult = await pool.query(
      'SELECT id, is_first_login FROM employee_credentials WHERE id = $1',
      [employeeId]
    );

    if (employeeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Dipendente non trovato' });
    }

    if (!employeeResult.rows[0].is_first_login) {
      return res.status(400).json({ error: 'Password già cambiata' });
    }

    // Hash nuova password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Aggiorna password e flag primo login
    await pool.query(
      'UPDATE employee_credentials SET password_hash = $1, is_first_login = false WHERE id = $1',
      [hashedPassword, employeeId]
    );

    res.json({ message: 'Password aggiornata con successo' });
  } catch (error) {
    console.error('Errore cambio password:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

// Verifica token
router.get('/verify', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

module.exports = router; 