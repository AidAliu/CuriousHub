import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/Auth.css'; 

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    username: '',
    email: '',
    password: '',
    age: '',
    role: 'USER' 
  });
  const [editMode, setEditMode] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios.get('http://localhost:8080/curioushub/api/v1/auth/users')
      .then(response => setUsers(response.data))
      .catch(error => {
        console.error('There was an error fetching the users!', error);
        alert('Error fetching users. Please try again later.');
      });
  };

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

    if (!validatePassword(formData.password) && !editMode) {
      alert('Password must be at least 8 characters long and contain both numbers and letters.');
      return;
    }

    const token = localStorage.getItem('token');

    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };

    // Password field handling
    if (editMode) {
      const updateData = { ...formData };
      if (!formData.password) {
        delete updateData.password; 
      }

      axios.put(`http://localhost:8080/curioushub/api/v1/auth/users/${userId}`, updateData, config)
        .then(() => {
          setEditMode(false);
          setUserId(null);
          fetchUsers();
        })
        .catch(error => {
          console.error('There was an error updating the user!', error);
          alert('Error updating user. Please try again later.');
        });
    } else {
      axios.post('http://localhost:8080/curioushub/api/v1/auth/users', formData, config)
        .then(() => fetchUsers())
        .catch(error => {
          console.error('There was an error creating the user!', error);
          alert('Error creating user. Please try again later.');
        });
    }

    setFormData({
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
      age: '',
      role: 'USER'
    });
  };

  const handleEditUser = (user) => {
    setEditMode(true);
    setUserId(user.id);
    setFormData({
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      password: '', 
      age: user.age,
      role: user.role
    });
  };

  const handleDeleteUser = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      axios.delete(`http://localhost:8080/curioushub/api/v1/auth/users/${id}`, config)
        .then(() => fetchUsers())
        .catch(error => {
          console.error('There was an error deleting the user!', error);
          alert('Error deleting user. Please try again later.');
        });
    }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setUserId(null);
    setFormData({
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      password: '',
      age: '',
      role: 'USER'
    });
  };

  return (
    <div>
      <h2>{editMode ? 'Edit User' : 'Create New User'}</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleChange}
          autoComplete="given-name"
          required
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleChange}
          autoComplete="family-name"
          required
        />
        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          autoComplete="new-username"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          required={!editMode}  
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          autoComplete="off"
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <button type="submit">{editMode ? 'Update User' : 'Create User'}</button>
        {editMode && <button type="button" onClick={cancelEdit}>Cancel</button>}
      </form>

      <h2>User List</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Age</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.firstname}</td>
              <td>{user.lastname}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.age}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleEditUser(user)}>Edit</button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
