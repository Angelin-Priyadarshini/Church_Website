import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('agstc_token') || null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('agstc_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (token) {
      // Validate session with backend API
      fetch(`${API_BASE}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => {
        if (!res.ok) throw new Error('Session invalid');
        return res.json();
      })
      .then(data => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(err => {
        console.error('Session check failed:', err);
        logout();
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = (jwtToken, userData) => {
    localStorage.setItem('agstc_token', jwtToken);
    setToken(jwtToken);
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      logout, 
      isAdmin: user?.role === 'admin',
      isModerator: user?.role === 'moderator' || user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
