import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Navbar.css';  

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

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

  return (
    <nav className="navbar">
      <a className="navbar-brand" href="#">CuriousHub</a>
      <div className="button-container">
        {token ? (
          <button className="btn btn-outline-light" onClick={handleLogoutClick}>Logout</button>
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
