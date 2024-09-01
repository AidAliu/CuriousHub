// src/components/admin/AdminDashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <div className="dashboard-content">
        <h2>Admin Dashboard</h2>
        <div className="dashboard-sections">
          <div className="dashboard-section">
            <h3>User Management</h3>
            <ul>
              <li><Link to="/users">Manage Users</Link></li>  
            </ul>
          </div>
          <div className="dashboard-section">
            <h3>Project Management</h3>
            <ul>
              <li><Link to="/projects">Manage Projects</Link></li>  
            </ul>
          </div>
          <div className="dashboard-section">
            <h3>Analytics</h3>
            <ul>
              <li><Link to="/analytics">View Analytics</Link></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
