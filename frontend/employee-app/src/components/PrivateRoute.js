import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, isFirstLogin } = useAuth();

  if (loading) {
    return <div>Caricamento...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Se è il primo login, reindirizza al cambio password
  if (isFirstLogin) {
    return <Navigate to="/change-password" />;
  }

  return children;
};

export default PrivateRoute; 