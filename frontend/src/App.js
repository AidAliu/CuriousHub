import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from "./pages/Home";
import Register from './components/auth/Register';
import ProjectManagement from './components/admin/ProjectManagement'; 
import UserManagement from './components/admin/UserManagement'; // Import UserManagement

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/projects" element={
            <ProtectedRoute allowedRole="ADMIN">
              <ProjectManagement />
            </ProtectedRoute>
          } />
          <Route path="/users" element={ 
            <ProtectedRoute allowedRole="ADMIN">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
