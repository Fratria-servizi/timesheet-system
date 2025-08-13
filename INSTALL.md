# Installazione Locale Sistema Timesheet

## Prerequisiti

- **Node.js** 18.x o superiore
- **PostgreSQL** 14.x o superiore
- **npm** o **yarn**
- **Git**

## Installazione

### 1. Clona il Repository
```bash
git clone <repository-url>
cd Timesheet
```

### 2. Setup Database PostgreSQL

#### Installa PostgreSQL
- **macOS**: `brew install postgresql`
- **Ubuntu/Debian**: `sudo apt-get install postgresql postgresql-contrib`
- **Windows**: Scarica da [postgresql.org](https://www.postgresql.org/download/windows/)

#### Crea Database
```bash
# Accedi a PostgreSQL
sudo -u postgres psql

# Crea database e utente
CREATE DATABASE timesheet;
CREATE USER timesheet_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE timesheet TO timesheet_user;
\q
```

#### Esegui Schema Database
```bash
# Connetti al database
psql -U timesheet_user -d timesheet -h localhost

# Esegui lo schema
\i database/schema.sql

# Esci
\q
```

### 3. Setup Backend

```bash
cd backend

# Installa dipendenze
npm install

# Crea file .env
cp .env.example .env
```

#### Configura .env
```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=timesheet
DB_USER=timesheet_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=5000
NODE_ENV=development
```

#### Inizializza Database con Dati di Esempio
```bash
# Dalla root del progetto
node scripts/init-db.js
```

#### Avvia Backend
```bash
# Modalità sviluppo
npm run dev

# Modalità produzione
npm start
```

### 4. Setup Frontend Apps

#### Admin App
```bash
cd frontend/admin-app

# Installa dipendenze
npm install

# Avvia in sviluppo
npm start
```

#### Company App
```bash
cd frontend/company-app

# Installa dipendenze
npm install

# Avvia in sviluppo
npm start
```

#### Employee App
```bash
cd frontend/employee-app

# Installa dipendenze
npm install

# Avvia in sviluppo
npm start
```

## Porte Utilizzate

- **Backend API**: http://localhost:5000
- **Admin App**: http://localhost:3000
- **Company App**: http://localhost:3001
- **Employee App**: http://localhost:3002

## Credenziali di Test

Dopo aver eseguito `node scripts/init-db.js`:

### Admin
- **URL**: http://localhost:3000
- **Username**: `admin`
- **Password**: `admin123`

### Azienda
- **URL**: http://localhost:3001
- **Username**: `aziendaesempio`
- **Password**: `company123`

### Dipendenti
- **URL**: http://localhost:3002
- **Username**: `emp001`, `emp002`, `emp003`
- **Password**: `password123`

## Struttura Progetto

```
Timesheet/
├── backend/                 # API Node.js
│   ├── config/             # Configurazioni
│   ├── controllers/        # Controller API
│   ├── middleware/         # Middleware (auth, validation)
│   ├── models/             # Modelli database
│   ├── routes/             # Route API
│   ├── server.js           # Server principale
│   └── package.json
├── frontend/               # App React
│   ├── admin-app/          # App amministrativa
│   ├── company-app/        # App azienda
│   └── employee-app/       # App dipendente
├── database/               # Schema e script database
│   └── schema.sql
├── scripts/                # Script di utilità
│   └── init-db.js
└── docs/                   # Documentazione
```

## Funzionalità Implementate

### Backend API
- ✅ Autenticazione JWT
- ✅ Gestione utenti e ruoli
- ✅ CRUD aziende
- ✅ Gestione dipendenti
- ✅ Sistema presenze
- ✅ Gestione permessi e ferie
- ✅ Export Excel
- ✅ Validazione input
- ✅ Middleware sicurezza

### Admin App
- ✅ Login amministratore
- ✅ Dashboard con statistiche
- ✅ Gestione aziende
- ✅ Configurazione funzionalità
- ✅ Creazione utenti azienda

### Company App
- ✅ Login referente azienda
- ✅ Gestione dipendenti
- ✅ Visualizzazione presenze
- ✅ Export report mensili
- ✅ Statistiche azienda

### Employee App
- ✅ Login dipendente
- ✅ Cambio password primo accesso
- ✅ Registrazione entrata/uscita
- ✅ Gestione pause
- ✅ Richieste permessi
- ✅ Storico presenze

## Test del Sistema

### 1. Verifica Backend
```bash
# Health check
curl http://localhost:5000/health

# Dovrebbe restituire: {"status":"OK","timestamp":"..."}
```

### 2. Test Login Admin
1. Vai su http://localhost:3000
2. Login con `admin` / `admin123`
3. Verifica accesso alla dashboard

### 3. Test Creazione Azienda
1. Login come admin
2. Vai su "Aziende" → "Nuova Azienda"
3. Compila form e salva
4. Verifica creazione in database

### 4. Test Funzionalità Dipendente
1. Login come dipendente su http://localhost:3002
2. Cambia password al primo accesso
3. Registra entrata/uscita
4. Verifica dati nel database

## Troubleshooting

### Problemi Database
```bash
# Verifica connessione
psql -U timesheet_user -d timesheet -h localhost

# Verifica tabelle
\dt

# Verifica dati
SELECT * FROM users;
```

### Problemi Backend
```bash
# Verifica log
cd backend
npm run dev

# Verifica variabili ambiente
echo $DB_HOST
echo $DB_PASSWORD
```

### Problemi Frontend
```bash
# Verifica dipendenze
npm install

# Pulisci cache
rm -rf node_modules package-lock.json
npm install

# Verifica proxy in package.json
```

### Errori Comuni

#### "Connection refused" Database
- Verifica che PostgreSQL sia in esecuzione
- Controlla credenziali in .env
- Verifica che il database esista

#### "Module not found" Frontend
- Esegui `npm install` in ogni app
- Verifica che tutte le dipendenze siano installate

#### "CORS error" API
- Verifica configurazione CORS nel backend
- Controlla che le app frontend usino le porte corrette

## Sviluppo

### Aggiungere Nuove Funzionalità

1. **Backend**: Crea nuove route in `backend/routes/`
2. **Database**: Aggiungi tabelle in `database/schema.sql`
3. **Frontend**: Crea nuovi componenti nelle app

### Modificare Schema Database

```bash
# Crea migration
cd database
# Modifica schema.sql

# Applica modifiche
psql -U timesheet_user -d timesheet -h localhost -f schema.sql
```

### Aggiornare Dipendenze

```bash
# Backend
cd backend
npm update

# Frontend (per ogni app)
cd frontend/admin-app
npm update
```

## Deploy Produzione

Vedi `deployment.md` per istruzioni complete su:
- Railway (backend + database)
- Vercel (frontend)
- Domini personalizzati
- SSL e sicurezza

## Support

Per problemi o domande:
1. Controlla i log del backend
2. Verifica configurazione database
3. Controlla variabili ambiente
4. Consulta `deployment.md` per hosting

## Licenza

MIT License - vedi LICENSE file per dettagli. 