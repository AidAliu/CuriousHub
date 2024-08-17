import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children, allowedRole}) => {
    const userRole = localStorage.getItem('role');


if (userRole !== allowedRole) {
    return <Navigate to="/home" />; 
  }

  return children;
};

export default ProtectedRoute;