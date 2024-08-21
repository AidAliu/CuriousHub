import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Dashboard.css'; 

const AdminDashboard = () => {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <div className="dashboard-sections">
        <div className="dashboard-section">
          <h3>User Management</h3>
          <ul>
            <li><Link to="/users">Manage Users</Link></li>  {/* Link to the UserManagement component */}
          </ul>
        </div>
        <div className="dashboard-section">
          <h3>Project Management</h3>
          <ul>
            <li><Link to="/projects">View All Projects</Link></li>
            <li><Link to="/projects/create">Add New Project</Link></li>
          </ul>
        </div>
        <div className="dashboard-section">
          <h3>Analytics</h3>
          <ul>
            <li><Link to="/analytics">View Analytics</Link></li>
          </ul>
        </div>
        {/* More sections can be added as needed */}
      </div>
    </div>
  );
};

export default AdminDashboard;
