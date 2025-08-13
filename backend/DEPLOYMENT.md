# 🚂 Deployment Backend su Railway

## Prerequisiti
- Account GitHub con accesso al repository `timesheet-system`
- Account Railway (gratuito per iniziare)

## Passi per il Deployment

### 1. Connessione a Railway
1. Vai su [Railway.app](https://railway.app)
2. Clicca "Login with GitHub"
3. Autorizza Railway ad accedere al tuo account GitHub

### 2. Creazione Nuovo Progetto
1. Clicca "New Project"
2. Seleziona "Deploy from GitHub repo"
3. Cerca e seleziona `Fratria-servizi/timesheet-system`
4. Clicca "Deploy Now"

### 3. Configurazione Variabili d'Ambiente
Railway creerà automaticamente un database PostgreSQL. Configura queste variabili:

```bash
# Database (Railway crea automaticamente queste)
DB_HOST=${PGHOST}
DB_PORT=${PGPORT}
DB_NAME=${PGDATABASE}
DB_USER=${PGUSER}
DB_PASSWORD=${PGPASSWORD}

# JWT Secret (genera una chiave sicura)
JWT_SECRET=your_super_secret_jwt_key_here

# Ambiente
NODE_ENV=production
PORT=5000

# CORS Origins (aggiorna con i tuoi domini)
CORS_ORIGINS=https://admin.timesheet.com,https://company.timesheet.com,https://employee.timesheet.com
```

### 4. Deployment Automatico
- Railway rileverà automaticamente che è un progetto Node.js
- Eseguirà `npm install` e `npm start`
- Il backend sarà disponibile su un URL tipo: `https://timesheet-backend-production.up.railway.app`

### 5. Verifica Deployment
1. Controlla i log per eventuali errori
2. Testa l'endpoint `/health`
3. Copia l'URL generato per usarlo nelle app frontend

## Troubleshooting

### Errori Comuni
- **Build fallito**: Verifica che `package.json` abbia lo script `start`
- **Porta occupata**: Railway gestisce automaticamente le porte
- **Database non connesso**: Verifica le variabili d'ambiente del database

### Log e Debug
- Usa i log di Railway per diagnosticare problemi
- Controlla che tutte le dipendenze siano installate
- Verifica che il server si avvii correttamente

## Prossimi Passi
Dopo il deployment del backend:
1. Aggiorna le configurazioni frontend con l'URL del backend
2. Deploya le app frontend su Vercel/Netlify
3. Testa l'integrazione completa 