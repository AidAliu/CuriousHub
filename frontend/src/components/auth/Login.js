import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
        alert('Login successful');
        console.log('Token:', data.token);

        // Store role and token in localStorage
        localStorage.setItem('role', data.role);
        localStorage.setItem('token', data.token);

        // Check the role and redirect accordingly
        if (data.role === 'ADMIN') {
          navigate('/dashboard');
        } else {
          navigate('/home');
        }
      } else {
        alert('Login failed: Invalid username or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert('An error occurred during login');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
        value={formData.username}
        autoComplete="username"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        value={formData.password}
        autoComplete="current-password"
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
