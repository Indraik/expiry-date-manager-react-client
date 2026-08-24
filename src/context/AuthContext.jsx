import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:5001';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('edm_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('edm_token') || null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('edm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('edm_user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('edm_token', token);
    } else {
      localStorage.removeItem('edm_token');
    }
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      const loggedInUser = data.data?.user || { email, name: email.split('@')[0] };
      const authToken = data.data?.token || 'mock_jwt_token';

      setUser(loggedInUser);
      setToken(authToken);

      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message || 'Server connection error' };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      const registeredUser = data.data?.user || { name, email };
      const authToken = data.data?.token || 'mock_jwt_token';

      setUser(registeredUser);
      setToken(authToken);

      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, message: err.message || 'Server connection error' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('edm_user');
    localStorage.removeItem('edm_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
