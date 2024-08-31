import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <ul>
        <li><Link to="/home">Home</Link></li>
        {/* Additional links can be added here if needed */}
      </ul>
    </div>
  );
};

export default Sidebar;
