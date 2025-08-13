// Configurazione API per l'app Admin
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://timesheet-system.onrender.com';

export const API_ENDPOINTS = {
  // Autenticazione
  ADMIN_LOGIN: `${API_BASE_URL}/api/auth/admin/login`,
  VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify`,
  
  // Aziende
  COMPANIES: `${API_BASE_URL}/api/admin/companies`,
  COMPANY_FEATURES: `${API_BASE_URL}/api/admin/company-features`,
  
  // Utenti
  USERS: `${API_BASE_URL}/api/admin/users`,
  
  // Dashboard
  DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
};

export default API_BASE_URL;
