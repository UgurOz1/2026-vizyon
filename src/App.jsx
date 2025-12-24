import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login'; // Will create placeholder
import { Toaster } from 'react-hot-toast'; // Need to install or use basic alert? User didn't specify toast but it's good UX.
// I'll stick to basic alerts or standard UI for now if not installed.
// User requested Lucide icons.

import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-romantic-50 font-sans text-slate-800">
        <Toaster position="top-center" toastOptions={{
          style: { background: '#fff0f5', color: '#db2777', border: '1px solid #fbcfe8' }
        }} />
        <Routes>
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
