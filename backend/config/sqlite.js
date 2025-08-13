const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Percorso del database SQLite
const dbPath = path.join(__dirname, '..', '..', 'database', 'timesheet.db');

// Crea connessione al database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Errore connessione database SQLite:', err.message);
  } else {
    console.log('Connesso al database SQLite');
  }
});

// Abilita foreign keys
db.run('PRAGMA foreign_keys = ON');

// Wrapper per query con Promise
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Wrapper per query singola con Promise
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Wrapper per run con Promise
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Wrapper per transazioni
function transaction(callback) {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      callback()
        .then(() => {
          db.run('COMMIT', (err) => {
            if (err) reject(err);
            else resolve();
          });
        })
        .catch((err) => {
          db.run('ROLLBACK', (rollbackErr) => {
            if (rollbackErr) console.error('Errore rollback:', rollbackErr);
            reject(err);
          });
        });
    });
  });
}

module.exports = {
  db,
  query,
  get,
  run,
  transaction
}; 