import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.username || !formData.password) {
      setError('Please enter both username and password.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/curioushub/api/v1/auth/authenticate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();

        // Debugging logs to ensure tokens are correct
        console.log("JWT Token:", data.token);
        console.log("Refresh Token:", data.refreshToken);

        // Store tokens correctly
        localStorage.setItem('token', data.token);   // Store JWT token
        localStorage.setItem('refreshToken', data.refreshToken); // Store refresh token
        localStorage.setItem('role', data.role);  // Store user role

        // Navigate based on role
        if (data.role === 'ADMIN') {
          navigate('/dashboard');
        } else {
          navigate('/home');
        }
      } else if (response.status === 403 || response.status === 401) {
        setError('Invalid username or password');
      } else {
        setError('Login failed: Please try again later');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Network error: Please check your internet connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
        value={formData.username}
        autoComplete="username"
        disabled={loading}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        value={formData.password}
        autoComplete="current-password"
        disabled={loading}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default Login;
