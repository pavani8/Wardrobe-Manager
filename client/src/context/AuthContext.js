import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const persistAuth = (token, user) => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
    setLoading(false);
  }, [token]);

  const handleAuthSuccess = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    persistAuth(newToken, userData);
    return { success: true };
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', { username, password });
      const { token: newToken, user: userData } = response.data;
      return handleAuthSuccess(newToken, userData);
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  };

  const loginWithGoogle = async (credential) => {
    try {
      const response = await axios.post('/api/auth/google', { credential });
      const { token: newToken, user: userData } = response.data;
      return handleAuthSuccess(newToken, userData);
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Google sign-in failed'
      };
    }
  };

  const register = async (username, email, password, gender = null) => {
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password,
        gender
      });
      const { token: newToken, user: userData, categoriesInitialized } = response.data;
      handleAuthSuccess(newToken, userData);
      return { success: true, categoriesInitialized: categoriesInitialized || false };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    token,
    login,
    loginWithGoogle,
    register,
    logout,
    loading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
