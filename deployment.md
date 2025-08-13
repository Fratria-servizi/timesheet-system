# Guida Deployment Sistema Timesheet

## Opzioni di Hosting Consigliate

### 1. POC e Testing (Gratuito)
**Firebase (Google)**
- Hosting per frontend
- Firestore per database (limitato)
- Autenticazione integrata
- Deploy automatico da GitHub
- **Vantaggi**: Gratuito, facile setup, integrato Google
- **Svantaggi**: Limitazioni database, non scalabile per produzione

### 2. Produzione (A pagamento ma economico)

#### Backend + Database
**Railway** (Consigliato per iniziare)
- Deploy automatico da GitHub
- PostgreSQL incluso
- SSL automatico
- **Costo**: ~$5-20/mese
- **Vantaggi**: Facile, economico, scalabile

**Render**
- Deploy automatico
- PostgreSQL incluso
- **Costo**: ~$7-25/mese
- **Vantaggi**: Stabile, buon supporto

#### Frontend
**Vercel** (Consigliato)
- Deploy automatico da GitHub
- SSL automatico
- CDN globale
- **Costo**: Gratuito per progetti personali, $20/mese per team
- **Vantaggi**: Velocissimo, ottimizzato React

**Netlify**
- Deploy automatico
- SSL automatico
- **Costo**: Gratuito per progetti personali, $19/mese per team
- **Vantaggi**: Facile, buon supporto

### 3. Enterprise (Scalabile)
**AWS**
- RDS per PostgreSQL
- EC2 per backend
- S3 + CloudFront per frontend
- **Costo**: ~$50-200/mese
- **Vantaggi**: Massima scalabilità, controllo completo

**Google Cloud Platform**
- Cloud SQL per PostgreSQL
- Cloud Run per backend
- Firebase Hosting per frontend
- **Costo**: ~$40-150/mese
- **Vantaggi**: Integrazione Google, buone performance

## Setup Railway (Raccomandato per iniziare)

### 1. Preparazione Repository
```bash
# Crea repository GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/tuousername/timesheet.git
git push -u origin main
```

### 2. Setup Railway
1. Vai su [railway.app](https://railway.app)
2. Login con GitHub
3. "New Project" → "Deploy from GitHub repo"
4. Seleziona il repository
5. Railway rileverà automaticamente Node.js

### 3. Configurazione Database
1. In Railway, vai su "New" → "Database" → "PostgreSQL"
2. Railway creerà automaticamente le variabili d'ambiente
3. Copia le variabili nel tuo progetto

### 4. Variabili d'Ambiente
```bash
# In Railway, vai su Variables e aggiungi:
NODE_ENV=production
JWT_SECRET=your_super_secret_key_here
DB_HOST=your_railway_db_host
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your_railway_db_password
```

### 5. Deploy Backend
1. Railway rileverà automaticamente il backend
2. Build command: `npm install && npm run build`
3. Start command: `npm start`
4. Railway assegnerà un dominio HTTPS

## Setup Vercel (Frontend)

### 1. Connessione GitHub
1. Vai su [vercel.com](https://vercel.com)
2. Login con GitHub
3. "New Project" → seleziona repository

### 2. Configurazione Build
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### 3. Variabili d'Ambiente
```bash
# In Vercel, vai su Settings → Environment Variables
REACT_APP_API_URL=https://your-railway-backend.railway.app
```

### 4. Deploy
Vercel farà deploy automatico ad ogni push su main

## Setup Database

### 1. Schema Iniziale
```bash
# Connetti al database Railway
psql "postgresql://user:password@host:port/railway"

# Esegui lo schema
\i database/schema.sql
```

### 2. Utente Admin
```sql
-- Crea password hash per admin
UPDATE users 
SET password_hash = crypt('admin123', gen_salt('bf'))
WHERE username = 'admin';
```

## Domini Personalizzati

### 1. Backend
- In Railway: Settings → Domains
- Aggiungi dominio: `api.tuousername.com`
- Configura DNS A record

### 2. Frontend
- In Vercel: Settings → Domains
- Aggiungi dominio: `admin.tuousername.com`
- Configura DNS CNAME record

## SSL e Sicurezza

### 1. HTTPS Automatico
- Railway e Vercel forniscono SSL automatico
- Certificati Let's Encrypt rinnovati automaticamente

### 2. CORS Configuration
```javascript
// Nel backend, aggiorna CORS per produzione
app.use(cors({
  origin: [
    'https://admin.tuousername.com',
    'https://company.tuousername.com',
    'https://employee.tuousername.com'
  ],
  credentials: true
}));
```

## Monitoring e Logs

### 1. Railway
- Logs in tempo reale
- Metriche CPU/Memory
- Alert automatici

### 2. Vercel
- Analytics performance
- Error tracking
- Deploy preview

## Backup e Recovery

### 1. Database
```bash
# Backup automatico Railway
# Backup manuale
pg_dump "postgresql://user:password@host:port/railway" > backup.sql

# Restore
psql "postgresql://user:password@host:port/railway" < backup.sql
```

### 2. Code
- GitHub mantiene tutto il codice
- Vercel mantiene deploy history
- Railway mantiene configurazioni

## Costi Stimati (Mensili)

### Startup (1-10 aziende)
- Railway Backend + DB: $10-15
- Vercel Frontend: $0-20
- **Totale**: $10-35/mese

### Crescita (10-100 aziende)
- Railway Backend + DB: $20-40
- Vercel Frontend: $20
- **Totale**: $40-60/mese

### Enterprise (100+ aziende)
- AWS/GCP: $100-300/mese
- Support dedicato: $200-500/mese
- **Totale**: $300-800/mese

## Checklist Deployment

- [ ] Repository GitHub configurato
- [ ] Railway progetto creato
- [ ] Database PostgreSQL configurato
- [ ] Variabili ambiente impostate
- [ ] Backend deployato e funzionante
- [ ] Vercel progetto creato
- [ ] Frontend deployato
- [ ] Domini personalizzati configurati
- [ ] SSL verificato
- [ ] Database schema eseguito
- [ ] Utente admin creato
- [ ] Test funzionalità completato
- [ ] Backup strategy implementata
- [ ] Monitoring configurato

## Support e Troubleshooting

### Problemi Comuni
1. **CORS errors**: Verifica variabili ambiente e configurazione CORS
2. **Database connection**: Controlla variabili DB in Railway
3. **Build errors**: Verifica package.json e dipendenze
4. **SSL issues**: Railway/Vercel gestiscono automaticamente

### Risorse
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Node.js Docs](https://nodejs.org/docs/) 