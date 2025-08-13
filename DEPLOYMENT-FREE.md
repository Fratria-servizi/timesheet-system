# 🆓 **Deployment Gratuito Completo - GitHub + Render**

## 🎯 **Obiettivo**
Deployare l'intero sistema Timesheet gratuitamente usando:
- **GitHub Actions** per CI/CD
- **GitHub Pages** per le app frontend
- **Render** per il backend (piano gratuito)

## 🚀 **URL Finali (Gratuiti)**
- **Backend API**: `https://timesheet-backend.onrender.com`
- **Admin App**: `https://fratria-servizi.github.io/timesheet-system/admin/`
- **Company App**: `https://fratria-servizi.github.io/timesheet-system/company/`
- **Employee App**: `https://fratria-servizi.github.io/timesheet-system/employee/`

## 📋 **Passi per il Deployment**

### **1. Abilita GitHub Pages**
1. Vai su [Repository Settings](https://github.com/Fratria-servizi/timesheet-system/settings)
2. Scorri fino a "Pages"
3. **Source**: Seleziona "GitHub Actions"
4. Salva

### **2. Configura Render (Backend)**
1. Vai su [Render.com](https://render.com)
2. Clicca "New +" → "Web Service"
3. Connetti il repository GitHub
4. Seleziona `timesheet-system`
5. **Build Command**: `npm install`
6. **Start Command**: `npm start`
7. **Plan**: Free
8. Clicca "Create Web Service"

### **3. Copia l'URL del Backend**
- Render ti darà un URL tipo: `https://timesheet-backend-xxxxx.onrender.com`
- Copialo per usarlo nei secrets di GitHub

### **4. Configura GitHub Secrets**
1. Vai su [Repository Settings → Secrets and variables → Actions](https://github.com/Fratria-servizi/timesheet-system/settings/secrets/actions)
2. Clicca "New repository secret"
3. Aggiungi:
   - **Name**: `BACKEND_URL`
   - **Value**: `https://tuo-backend.onrender.com`

### **5. Deploy Automatico**
- Pusha su `deployment` branch
- GitHub Actions si attiverà automaticamente
- Le app verranno deployate su GitHub Pages

## 🔧 **Configurazioni Automatiche**

### **GitHub Actions**
- ✅ Build automatico ad ogni push
- ✅ Test automatici
- ✅ Deploy su GitHub Pages
- ✅ Configurazione ambiente

### **Render Backend**
- ✅ Database SQLite integrato
- ✅ HTTPS automatico
- ✅ Scaling automatico
- ✅ Logs in tempo reale

## 📱 **Test delle App**

### **Backend Health Check**
```bash
curl https://tuo-backend.onrender.com/health
# Risposta: {"status":"OK","timestamp":"..."}
```

### **Frontend Apps**
- Admin: `https://fratria-servizi.github.io/timesheet-system/admin/`
- Company: `https://fratria-servizi.github.io/timesheet-system/company/`
- Employee: `https://fratria-servizi.github.io/timesheet-system/employee/`

## 🆓 **Vantaggi del Piano Gratuito**

### **GitHub**
- ✅ Hosting illimitato
- ✅ CI/CD gratuito
- ✅ Domini personalizzati
- ✅ SSL automatico

### **Render**
- ✅ 750 ore/mese gratuite
- ✅ Database SQLite integrato
- ✅ HTTPS automatico
- ✅ Deploy automatico

## 🚨 **Limitazioni Piano Gratuito**

### **Render**
- ⚠️ 750 ore/mese (circa 31 giorni)
- ⚠️ Sleep dopo 15 minuti di inattività
- ⚠️ Database SQLite (non PostgreSQL)

### **GitHub Pages**
- ⚠️ Solo siti statici
- ⚠️ Build time limitato
- ⚠️ No server-side rendering

## 🔄 **Aggiornamenti**
- Push su `deployment` branch
- Deploy automatico in 2-5 minuti
- Zero downtime

## 💡 **Pro Tips**
1. **Monitora le ore Render** per evitare costi
2. **Usa branch protection** per `deployment`
3. **Testa localmente** prima del push
4. **Verifica i logs** in caso di errori

---

## 🎉 **Risultato Finale**
Dopo il deployment avrai **4 URL pubblici gratuiti** per mostrare il sistema ai clienti! 