import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  const handleLogoutClick = () => {
    // Clear both access token and refresh token on logout
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('user'); // Remove user data as well
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleHomeClick = (e) => {
    e.preventDefault(); // Prevent default anchor behavior
    navigate('/home');
  };

  return (
    <nav className="navbar">
      <a className="navbar-brand" href="/home" onClick={handleHomeClick}>
        CuriousHub
      </a>
      <div className="button-container">
        {token ? (
          <>
            {role === 'ADMIN' && location.pathname !== '/dashboard' && (
              <button
                className="btn btn-outline-light"
                onClick={handleDashboardClick}
              >
                Admin Dashboard
              </button>
            )}
            <button className="btn btn-outline-light" onClick={handleLogoutClick}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-outline-light" onClick={handleLoginClick}>
              Login
            </button>
            <button
              className="btn btn-outline-light"
              onClick={handleRegisterClick}
            >
              Register
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
