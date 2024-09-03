import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
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

  const navigate = useNavigate(); // Initialize the navigate function

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

    if (!validatePassword(formData.password)) {
      alert('Password must be at least 8 characters long and contain both numbers and letters.');
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
        alert('Registration successful');
        navigate('/login'); // Redirect to login after successful registration
      } else {
        const errorData = await response.json();
        if (errorData && errorData.message) {
          alert(`Registration failed: ${errorData.message}`);
        } else {
          alert(`Registration failed with status code: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error during registration:', error);
      alert('An error occurred during registration');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create your account in CuriousHub</h2>
      <input
        type="text"
        name="firstname"
        placeholder="First Name"
        onChange={handleChange}
        autoComplete="given-name"
      />
      <input
        type="text"
        name="lastname"
        placeholder="Last Name"
        onChange={handleChange}
        autoComplete="family-name"
      />
      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
        autoComplete="new-username"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        autoComplete="email"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        autoComplete="new-password"
      />
      <input
        type="number"
        name="age"
        placeholder="Age"
        onChange={handleChange}
        autoComplete="off"
      />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
