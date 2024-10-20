import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Corrected import statement

const ProtectedRoute = ({ children, allowedRole }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    if (!token) {
      console.warn('No token found in localStorage.');
      setIsAuthorized(false);
      return;
    }

    try {
      // Decode the JWT token to check for expiry
      console.log('jwtDecode function:', jwtDecode);
      const decodedToken = jwtDecode(token);
      console.log('Decoded Token:', decodedToken);
      const currentTime = Date.now() / 1000;

      // Check if token has expired
      if (decodedToken.exp < currentTime) {
        console.warn('Token has expired.');
        setIsAuthorized(false);
        return;
      }

      // Check if the user's role matches the allowedRole
      if (allowedRole && userRole !== allowedRole) {
        console.warn(
          `User role "${userRole}" does not match allowed role "${allowedRole}".`
        );
        setIsAuthorized(false);
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Error decoding token:', error);
      setIsAuthorized(false);
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

  
  return children;
};

export default ProtectedRoute;
