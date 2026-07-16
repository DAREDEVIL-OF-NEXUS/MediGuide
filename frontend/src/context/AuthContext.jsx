import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth as authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(true);

  const validateToken = useCallback(async () => {
    const storedToken = localStorage.getItem('access_token');
    if (!storedToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getProfile();
      setUser(response.data);
      setToken(storedToken);
    } catch (error) {
      console.error('Token validation failed:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  const login = async (email, password) => {
    const response = await authApi.login({ email, password });
    const { access_token, refresh_token, token_type } = response.data;

    localStorage.setItem('access_token', access_token);
    if (refresh_token) {
      localStorage.setItem('refresh_token', refresh_token);
    }

    setToken(access_token);

    // Fetch user profile
    const profileResponse = await authApi.getProfile();
    setUser(profileResponse.data);
    localStorage.setItem('user', JSON.stringify(profileResponse.data));

    return profileResponse.data;
  };

  const register = async (fullName, email, password, emergencyContacts = []) => {
    const response = await authApi.register({
      full_name: fullName,
      email,
      password,
      emergency_contacts: emergencyContacts,
    });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  const updateProfile = async (data) => {
    const response = await authApi.updateProfile(data);
    setUser(response.data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
