import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Categories from './pages/Categories';
import Dresses from './pages/Dresses';
import AddDress from './pages/AddDress';
import EditDress from './pages/EditDress';
import BulkUpload from './pages/BulkUpload';
import Comments from './pages/Comments';
import AdminPanel from './pages/admin/AdminPanel';
import './App.css';

const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

function AppRoutes() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/categories" element={<PrivateRoute><Categories /></PrivateRoute>} />
            <Route path="/dresses" element={<PrivateRoute><Dresses /></PrivateRoute>} />
            <Route path="/add-dress" element={<PrivateRoute><AddDress /></PrivateRoute>} />
            <Route path="/edit-dress/:id" element={<PrivateRoute><EditDress /></PrivateRoute>} />
            <Route path="/bulk-upload" element={<PrivateRoute><BulkUpload /></PrivateRoute>} />
            <Route path="/comments" element={<PrivateRoute><Comments /></PrivateRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

function App() {
  if (googleClientId) {
    return (
      <GoogleOAuthProvider clientId={googleClientId}>
        <AppRoutes />
      </GoogleOAuthProvider>
    );
  }
  return <AppRoutes />;
}

export default App;
