import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  if (!token || userRole !== allowedRole) {
    return <Navigate to="/login" replace />; 
  }

  return children;
};

export default ProtectedRoute;
