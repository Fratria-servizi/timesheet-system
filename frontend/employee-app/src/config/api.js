// Configurazione API per l'app Employee
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://timesheet-system.onrender.com';

export const API_ENDPOINTS = {
  // Autenticazione
  EMPLOYEE_LOGIN: `${API_BASE_URL}/api/auth/employee/login`,
  VERIFY_TOKEN: `${API_BASE_URL}/api/auth/verify`,
  CHANGE_PASSWORD: `${API_BASE_URL}/api/auth/employee/change-password`,
  
  // Dashboard
  DASHBOARD: `${API_BASE_URL}/api/employee/dashboard`,
  
  // Time Tracking
  TIME_ENTRY: `${API_BASE_URL}/api/employee/time-entry`,
  TIME_RECORDS: `${API_BASE_URL}/api/employee/time-records`,
  
  // Richieste ferie
  LEAVE_REQUESTS: `${API_BASE_URL}/api/employee/leave-requests`,
  CREATE_LEAVE_REQUEST: `${API_BASE_URL}/api/employee/leave-request`,
  
  // Profilo
  PROFILE: `${API_BASE_URL}/api/employee/profile`,
  UPDATE_PROFILE: `${API_BASE_URL}/api/employee/profile`,
};

export default API_BASE_URL;
