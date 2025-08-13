// Configurazione API per l'app Company
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://timesheet-system.onrender.com';

export const API_ENDPOINTS = {
  // Autenticazione
  COMPANY_LOGIN: `${API_BASE_URL}/api/auth/company/login`,
  VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify`,
  
  // Dipendenti
  EMPLOYEES: `${API_BASE_URL}/api/company/employees`,
  EMPLOYEE_DETAILS: `${API_BASE_URL}/api/company/employees`,
  
  // Presenze
  TIME_RECORDS: `${API_BASE_URL}/api/company/time-records`,
  TIME_RECORDS_EXPORT: `${API_BASE_URL}/api/company/time-records/export`,
  
  // Richieste ferie
  LEAVE_REQUESTS: `${API_BASE_URL}/api/company/leave-requests`,
  
  // Dashboard
  DASHBOARD: `${API_BASE_URL}/api/company/dashboard`,
  
  // Report
  REPORTS: `${API_BASE_URL}/api/company/reports`,
};

export default API_BASE_URL;
