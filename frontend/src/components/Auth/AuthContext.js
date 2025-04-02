// frontend/src/components/Auth/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import api from '../../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user from token on initial load
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if token exists in localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setLoading(false);
          return;
        }
        
        // Check if token is expired
        const decodedToken = jwt_decode(token);
        if (decodedToken.exp * 1000 < Date.now()) {
          localStorage.removeItem('token');
          setLoading(false);
          return;
        }
        
        // Set token to Auth header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user info
        const response = await api.get('/api/auth/me');
        setUser(response.data.user);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Register a new user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token to Auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user in state
      setUser(user);
      
      return user;
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setError(null);
      const response = await api.post('/api/auth/login', credentials);
      const { token, user } = response.data;
      
      // Save token to localStorage
      localStorage.setItem('token', token);
      
      // Set token to Auth header
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set user in state
      setUser(user);
      
      return user;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  // Logout user
  const logout = () => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove token from Auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Reset user in state
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      register,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};