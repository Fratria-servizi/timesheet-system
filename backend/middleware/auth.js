const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token di accesso richiesto' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Verifica che l'utente esista ancora nel database
    const userResult = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Utente non valido' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token non valido' });
  }
};

const authenticateEmployee = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token di accesso richiesto' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Verifica credenziali dipendente
    const employeeResult = await pool.query(`
      SELECT ec.id, ec.employee_id, ec.username, ec.is_first_login,
             e.first_name, e.last_name, e.company_id, e.status
      FROM employee_credentials ec
      JOIN employees e ON ec.employee_id = e.id
      WHERE ec.id = $1 AND e.status = 'active'
    `, [decoded.employeeId]);

    if (employeeResult.rows.length === 0) {
      return res.status(401).json({ error: 'Credenziali dipendente non valide' });
    }

    req.employee = employeeResult.rows[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token non valido' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Autenticazione richiesta' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permessi insufficienti' });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authenticateEmployee,
  requireRole
}; 