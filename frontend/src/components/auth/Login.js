import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import '../styles/Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
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
      const response = await apiClient.post('/auth/authenticate', formData);
      const data = response.data;

      // Debugging logs to ensure tokens are correct
      console.log('Authentication Response Data:', data);

      // Check if data contains token and user
      if (!data.token || !data.user) {
        throw new Error('Invalid response from server');
      }

      // Store tokens and user data
      localStorage.setItem('token', data.token); // Store JWT token
      localStorage.setItem('refreshToken', data.refreshToken); // Store refresh token
      localStorage.setItem('role', data.role); // Store role
      localStorage.setItem('user', JSON.stringify(data.user)); // Store user data

      // Navigate based on role
      if (data.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/home');
      }
    } catch (error) {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        setError('Invalid username or password');
      } else {
        console.error('Error during login:', error);
        setError('Login failed: Please try again later');
      }
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
