import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: localStorage.getItem('token'), isAuthenticated: false, user: null });

  useEffect(() => {
    if (auth.token) {
      axios.get('http://localhost:5000/api/auth/me', { headers: { 'x-auth-token': auth.token } })
        .then(response => setAuth({ token: auth.token, isAuthenticated: true, user: response.data }))
        .catch(() => setAuth({ token: null, isAuthenticated: false, user: null }));
    }
  }, [auth.token]);

  const register = async (userData) => {
    const response = await axios.post('http://localhost:5000/api/auth/register', userData);
    localStorage.setItem('token', response.data.token);
    setAuth({ token: response.data.token, isAuthenticated: true, user: null });
  };

  const login = async (userData) => {
    const response = await axios.post('http://localhost:5000/api/auth/login', userData);
    localStorage.setItem('token', response.data.token);
    setAuth({ token: response.data.token, isAuthenticated: true, user: null });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuth({ token: null, isAuthenticated: false, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider, useAuth };
