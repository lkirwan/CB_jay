import { useState, useCallback, useEffect } from 'react';
import { authApi, clearStoredToken, getStoredToken, setStoredToken } from '../lib/api';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const hasStoredToken = Boolean(getStoredToken());
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(hasStoredToken);

  useEffect(() => {
    let isMounted = true;
    const token = getStoredToken();
    if (!token) {
      return () => {
        isMounted = false;
      };
    }

    authApi.me()
      .then((currentUser) => {
        if (!isMounted) return;
        setUser(currentUser);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (!isMounted) return;
        clearStoredToken();
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (password) => {
    const response = await authApi.login(password);
    setStoredToken(response.token);
    setUser({ username: response.username, role: response.role });
    setIsAuthenticated(true);
    return response;
  }, []);

  const logout = useCallback(() => {
    clearStoredToken();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

