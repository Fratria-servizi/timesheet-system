# 🚀 Configurazione Deployment Online

## 📋 **Variabili d'Ambiente Backend**

Crea un file `.env` nel backend con:

```env
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🗄️ **Database PostgreSQL Online**

### Opzione 1: Railway
1. Vai su https://railway.app
2. Crea nuovo progetto
3. Aggiungi PostgreSQL
4. Copia la DATABASE_URL

### Opzione 2: Render
1. Vai su https://render.com
2. Crea nuovo PostgreSQL
3. Copia la DATABASE_URL

### Opzione 3: Supabase
1. Vai su https://supabase.com
2. Crea nuovo progetto
3. Copia la DATABASE_URL

## 🔧 **Backend Deployment**

### Railway (Raccomandato)
1. Connetti repository GitHub
2. Imposta variabili d'ambiente
3. Deploy automatico

### Render
1. Connetti repository GitHub
2. Imposta build command: `npm install && npm run build`
3. Imposta start command: `npm start`
4. Imposta variabili d'ambiente

## 🌐 **Frontend Deployment**

### Vercel (Raccomandato)
1. Vai su https://vercel.com
2. Connetti repository GitHub
3. Per ogni app, crea nuovo progetto
4. Imposta build settings:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

### Netlify
1. Vai su https://netlify.com
2. Connetti repository GitHub
3. Imposta build settings simili a Vercel

## 📱 **Configurazione App Frontend**

### Admin App
Aggiorna `frontend/admin-app/package.json`:
```json
{
  "homepage": "https://your-admin-domain.vercel.app",
  "proxy": "https://your-backend-domain.railway.app"
}
```

### Company App
Aggiorna `frontend/company-app/package.json`:
```json
{
  "homepage": "https://your-company-domain.vercel.app",
  "proxy": "https://your-backend-domain.railway.app"
}
```

### Employee App
Aggiorna `frontend/employee-app/package.json`:
```json
{
  "homepage": "https://your-employee-domain.vercel.app",
  "proxy": "https://your-backend-domain.railway.app"
}
```

## 🔒 **Sicurezza Produzione**

1. **JWT_SECRET**: Usa una stringa lunga e casuale
2. **CORS**: Limita solo ai domini autorizzati
3. **Rate Limiting**: Abilita per prevenire abusi
4. **HTTPS**: Usa sempre HTTPS in produzione
5. **Database**: Usa connessioni sicure (SSL)

## 📊 **Monitoraggio**

- **Railway**: Dashboard integrato
- **Vercel**: Analytics e performance
- **Logs**: Monitora errori e performance

## 🚨 **Troubleshooting**

### Errori Comuni
1. **CORS**: Verifica CORS_ORIGIN
2. **Database**: Verifica DATABASE_URL
3. **Build**: Verifica build commands
4. **Environment**: Verifica variabili d'ambiente

### Debug
- Controlla logs del backend
- Verifica connessione database
- Testa API endpoints 