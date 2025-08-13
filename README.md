# 🕐 Timesheet Management System

Un sistema completo di gestione timesheet con tre applicazioni web integrate: **Admin**, **Company** e **Employee**.

## 🌟 **Caratteristiche Principali**

### 👑 **Admin App**
- Gestione aziende e utenti
- Configurazione funzionalità per azienda
- Dashboard di sistema completo

### 🏢 **Company App**
- Gestione dipendenti
- Visualizzazione time records
- Report e analisi
- Export Excel

### 👤 **Employee App**
- Time tracking (entrata/uscita/pausa)
- Richieste ferie e permessi
- Gestione profilo
- Dashboard personale

## 🏗️ **Architettura**

- **Backend**: Node.js + Express.js
- **Database**: PostgreSQL (produzione) / SQLite (sviluppo)
- **Frontend**: React.js + Material-UI
- **Autenticazione**: JWT
- **API**: RESTful

## 🚀 **Demo Online**

- **Admin App**: [https://timesheet-admin.vercel.app](https://timesheet-admin.vercel.app)
- **Company App**: [https://timesheet-company.vercel.app](https://timesheet-company.vercel.app)
- **Employee App**: [https://timesheet-employee.vercel.app](https://timesheet-employee.vercel.app)

## 📋 **Credenziali Demo**

### Admin
- **Username**: `admin`
- **Password**: `admin123`

### Company
- **Username**: `aziendaesempio`
- **Password**: `company123`

### Employee
- **Username**: `emp001`
- **Password**: `password123`

## 🛠️ **Installazione Locale**

### Prerequisiti
- Node.js 18+
- npm o yarn
- PostgreSQL (opzionale, per produzione)

### Setup
```bash
# Clone repository
git clone https://github.com/tuousername/timesheet-system.git
cd timesheet-system

# Installa dipendenze backend
cd backend
npm install

# Installa dipendenze frontend
cd ../frontend/admin-app
npm install
cd ../company-app
npm install
cd ../employee-app
npm install

# Configura database
cd ../../scripts
node init-sqlite-simple.js

# Avvia backend
cd ../backend
npm run sqlite

# In nuovi terminali, avvia le app
cd ../frontend/admin-app
npm start

cd ../frontend/company-app
npm start

cd ../frontend/employee-app
npm start
```

## 🌐 **Porte Locali**

- **Backend**: http://localhost:5001
- **Admin App**: http://localhost:3000
- **Company App**: http://localhost:3001
- **Employee App**: http://localhost:3002

## 📊 **API Endpoints**

### Autenticazione
- `POST /api/auth/admin/login` - Login admin
- `POST /api/auth/company/login` - Login company
- `POST /api/auth/employee/login` - Login employee
- `GET /api/auth/verify` - Verifica token

### Employee
- `GET /api/employee/dashboard` - Dashboard dipendente
- `POST /api/employee/time-entry` - Registra entrata/uscita/pausa
- `GET /api/employee/time-records` - Storico time records
- `POST /api/employee/leave-request` - Crea richiesta ferie
- `GET /api/employee/leave-requests` - Lista richieste ferie

## 🚀 **Deployment**

### Backend + Database
- **Railway**: https://railway.app
- **Render**: https://render.com
- **Heroku**: https://heroku.com

### Frontend
- **Vercel**: https://vercel.com
- **Netlify**: https://netlify.com

## 🔧 **Configurazione Produzione**

1. Crea file `.env` nel backend:
```env
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secret-key
CORS_ORIGIN=https://yourdomain.com
```

2. Aggiorna `package.json` delle app frontend con homepage corrette

## 📝 **Licenza**

MIT License

## 🤝 **Contributi**

Pull requests sono benvenuti!

## 📞 **Supporto**

Per domande o supporto, apri una issue su GitHub. 