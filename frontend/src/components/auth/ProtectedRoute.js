import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem('token');   // Fetch JWT token from localStorage
  const userRole = localStorage.getItem('role'); // Fetch user role from localStorage

  // Validate if the token exists and the role matches the allowed role
  if (!token || userRole !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;  // If validation passes, render the protected component
};

export default ProtectedRoute;
