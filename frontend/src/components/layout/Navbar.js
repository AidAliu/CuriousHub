import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../components/styles/Navbar.css';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegisterClick = () => {
    navigate('/register');
  };

  return (
    <nav className="navbar">
      <a className="navbar-brand" href="#">CuriousHub</a>
      <div className="button-container">
        <button className="btn btn-outline-light" onClick={handleLoginClick}>Login</button>
        <button className="btn btn-outline-light" onClick={handleRegisterClick}>Register</button>
      </div>
    </nav>
  );
}
