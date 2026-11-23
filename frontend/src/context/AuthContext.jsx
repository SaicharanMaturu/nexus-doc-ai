import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredToken,
  getStoredUser,
  setStoredSession,
  clearStoredSession,
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  requestPasswordReset,
  confirmPasswordReset
} from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  // Initialize and verify existing session with backend on mount
  useEffect(() => {
    let mounted = true;

    async function verifyInitialSession() {
      const storedTok = getStoredToken();
      if (!storedTok) {
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser();
        if (response?.user && mounted) {
          setUser(response.user);
          setToken(storedTok);
        } else if (mounted) {
          clearStoredSession();
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        if (mounted) {
          clearStoredSession();
          setUser(null);
          setToken(null);
          if (err.status === 401) {
            setSessionExpiredNotice(true);
          }
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    verifyInitialSession();

    // Listen for custom session expired event from API service
    const handleExpiredEvent = () => {
      clearStoredSession();
      setUser(null);
      setToken(null);
      setSessionExpiredNotice(true);
    };

    window.addEventListener('nexus:session-expired', handleExpiredEvent);
    return () => {
      mounted = false;
      window.removeEventListener('nexus:session-expired', handleExpiredEvent);
    };
  }, []);

  const login = useCallback(async (email, password, rememberMe = false) => {
    setSessionExpiredNotice(false);
    const data = await loginUser(email, password, rememberMe);
    setUser(data.user);
    setToken(data.session.token);
    return data;
  }, []);

  const register = useCallback(async ({ email, password, name, organization }) => {
    setSessionExpiredNotice(false);
    const data = await registerUser({ email, password, name, organization });
    setUser(data.user);
    setToken(data.session.token);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
    setSessionExpiredNotice(false);
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return requestPasswordReset(email);
  }, []);

  const resetPassword = useCallback(async (email, token, newPassword) => {
    return confirmPasswordReset(email, token, newPassword);
  }, []);

  const dismissSessionExpiredNotice = useCallback(() => {
    setSessionExpiredNotice(false);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    sessionExpiredNotice,
    dismissSessionExpiredNotice,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword
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
