import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  subscriptionTier?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          // Verify token with backend
          const response = await authApi.verify();
          if (response.success) {
            setUser(response.user);
            setToken(savedToken);
          } else {
            logout();
          }
        } catch (error) {
          console.error('Auth verification failed:', error);
          // Keep local state if verification fails (offline support or temp network issue)
          // or logout if it's a 401 (handled by interceptor)
          setUser(JSON.parse(savedUser));
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newUser: User, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
