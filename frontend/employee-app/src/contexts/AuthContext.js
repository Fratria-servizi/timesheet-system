import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('employeeToken');
    if (token) {
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      const response = await axios.get('http://localhost:5001/api/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.valid) {
        setUser(response.data.user);
        setIsAuthenticated(true);
        // Verifica se è il primo login
        if (response.data.user.isFirstLogin) {
          setIsFirstLogin(true);
        }
      } else {
        localStorage.removeItem('employeeToken');
      }
    } catch (error) {
      localStorage.removeItem('employeeToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('http://localhost:5001/api/auth/employee/login', {
        username,
        password
      });
      
      const { token, user } = response.data;
      localStorage.setItem('employeeToken', token);
      setUser(user);
      setIsAuthenticated(true);
      setIsFirstLogin(user.isFirstLogin || false);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Errore durante il login' 
      };
    }
  };

  const changePassword = async (newPassword) => {
    try {
      const token = localStorage.getItem('employeeToken');
      const response = await axios.post('http://localhost:5001/api/auth/employee/change-password', {
        newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setIsFirstLogin(false);
        return { success: true };
      }
      return { success: false, error: response.data.error };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Errore durante il cambio password' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('employeeToken');
    setUser(null);
    setIsAuthenticated(false);
    setIsFirstLogin(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    isFirstLogin,
    login,
    logout,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 