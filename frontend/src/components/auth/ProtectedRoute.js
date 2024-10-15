import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';  // Correct import for jwt-decode

const ProtectedRoute = ({ children, allowedRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // For loading state

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // Check if token exists
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    try {
      // Decode the JWT token to check for expiry
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      // Check if token has expired
      if (decodedToken.exp < currentTime) {
        setIsAuthorized(false);
        return;
      }

      // Check if the user's role matches the allowedRole
      if (allowedRole && userRole !== allowedRole) {
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);  // User is authorized
    } catch (error) {
      console.error('Error decoding token', error);
      setIsAuthorized(false); // Token might be invalid
    }
  }, [allowedRole]);

  // While checking for authorization, show a loading message
  if (isAuthorized === null) {
    return <div>Loading...</div>;
  }

  // If not authorized, redirect to login page
  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  // If authorized, render the protected component
  return children;
};

export default ProtectedRoute;
