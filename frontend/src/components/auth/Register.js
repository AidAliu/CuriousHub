import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/Auth.css'; 

function Register() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    age: ''
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

  const validatePassword = (password) => {
    const minLength = 8;
    const hasNumber = /\d/;
    const hasLetter = /[a-zA-Z]/;
    return password.length >= minLength && hasNumber.test(password) && hasLetter.test(password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!validatePassword(formData.password)) {
      alert('Password must be at least 8 characters long and contain both numbers and letters.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/curioushub/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Registration successful:', data);

        // Store tokens and role in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('role', data.role);

        // Navigate to the appropriate page based on role
        if (data.role === 'ADMIN') {
          navigate('/dashboard');
        } else {
          navigate('/home');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create your account in CuriousHub</h2>
      {error && <p className="error">{error}</p>}
      <input
        type="text"
        name="firstname"
        placeholder="First Name"
        onChange={handleChange}
        value={formData.firstname}
        autoComplete="given-name"
      />
      <input
        type="text"
        name="lastname"
        placeholder="Last Name"
        onChange={handleChange}
        value={formData.lastname}
        autoComplete="family-name"
      />
      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
        value={formData.username}
        autoComplete="new-username"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        value={formData.email}
        autoComplete="email"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        value={formData.password}
        autoComplete="new-password"
      />
      <input
        type="number"
        name="age"
        placeholder="Age"
        onChange={handleChange}
        value={formData.age}
        autoComplete="off"
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
}

export default Register;
