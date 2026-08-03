import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CodeEntry from './pages/CodeEntry';
import TeacherEntry from './pages/TeacherEntry';
import VideoRoom from './pages/VideoRoom';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const [adminToken, setAdminToken] = useState(localStorage.getItem('adminToken'));

  const handleAdminLogin = (token) => {
    localStorage.setItem('adminToken', token);
    setAdminToken(token);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminToken(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/enter" element={<CodeEntry />} />
          <Route path="/teacher" element={<TeacherEntry />} />
          <Route path="/session/:code" element={<VideoRoom />} />
          <Route
            path="/admin/login"
            element={
              adminToken ? (
                <Navigate to="/admin/dashboard" />
              ) : (
                <AdminLogin onLogin={handleAdminLogin} />
              )
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              adminToken ? (
                <AdminDashboard token={adminToken} onLogout={handleAdminLogout} />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
