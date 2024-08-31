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
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleHomeClick = () => {
    navigate('/'); // Navigate to the home page
  };

  return (
    <nav className="navbar">
      <a className="navbar-brand" href="#" onClick={handleHomeClick}>CuriousHub</a>
      <div className="button-container">
        {token ? (
          <>
            {role === 'ADMIN' && location.pathname !== '/dashboard' && (
              <button className="btn btn-outline-light" onClick={handleDashboardClick}>
                Admin Dashboard
              </button>
            )}
            <button className="btn btn-outline-light" onClick={handleLogoutClick}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn btn-outline-light" onClick={handleLoginClick}>Login</button>
            <button className="btn btn-outline-light" onClick={handleRegisterClick}>Register</button>
          </>
        )}
      </div>
    </nav>
  );
}
