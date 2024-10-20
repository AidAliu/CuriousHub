import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Login from './components/auth/Login';
import AdminDashboard from './components/admin/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Register from './components/auth/Register';
import ProjectDetails from './pages/ProjectDetails';
import ProjectManagement from './components/admin/ProjectManagement';
import UserManagement from './components/admin/UserManagement';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} /> {/* Default route */}
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
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
          <Route path="/projects/:id" element={
            <ProtectedRoute>
              <ProjectDetails />
            </ProtectedRoute>
          } />
          <Route path="/users" element={
            <ProtectedRoute allowedRole="ADMIN">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="*" element={<h1>404 - Not Found</h1>} /> {/* Catch-all route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
