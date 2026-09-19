import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jobconnect_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user profile on initial mount if token exists
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setUser(res.data.user);
          localStorage.setItem('jobconnect_user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Session validation failed:', err);
        setToken(null);
        setUser(null);
        localStorage.removeItem('jobconnect_token');
        localStorage.removeItem('jobconnect_user');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('jobconnect_token', receivedToken);
        localStorage.setItem('jobconnect_user', JSON.stringify(receivedUser));
        return { success: true, user: receivedUser };
      }
      return { success: false, message: res.data?.message || 'Login failed' };
    } catch (err) {
      let message = 'Login failed. Please check your credentials.';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        message = 'Cannot connect to backend server. Please verify the backend is running on http://127.0.0.1:5000.';
      }
      return { success: false, message };
    }
  };

  // Register handler
  const register = async (formData) => {
    try {
      const res = await api.post('/auth/register', formData);
      if (res.data && res.data.success) {
        const { token: receivedToken, user: receivedUser } = res.data;
        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('jobconnect_token', receivedToken);
        localStorage.setItem('jobconnect_user', JSON.stringify(receivedUser));
        return { success: true, user: receivedUser };
      }
      return { success: false, message: res.data?.message || 'Registration failed' };
    } catch (err) {
      let message = 'Registration failed. Please check your details.';
      if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.response?.data?.errors) {
        message = Array.isArray(err.response.data.errors)
          ? err.response.data.errors.join(', ')
          : String(err.response.data.errors);
      } else if (err.code === 'ERR_NETWORK' || !err.response) {
        message = 'Cannot connect to backend server. Please verify the backend is running on http://127.0.0.1:5000.';
      }
      return { success: false, message };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('jobconnect_token');
    localStorage.removeItem('jobconnect_user');
  };

  // Refresh user data (e.g. after profile update)
  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        localStorage.setItem('jobconnect_user', JSON.stringify(res.data.user));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const updateLocalUser = (updatedData) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('jobconnect_user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
        refreshUser,
        updateLocalUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
