import { createContext, useState, useEffect } from 'react';
import type { PropsWithChildren } from 'react';
import { apiClient } from '../api/client';

type AuthState = {
  token: string | null;
  user: {
    userId: string | null;
    name: string | null;
  };
};

type AuthContextType = {
  auth: AuthState;
  isAuthenticated: boolean;
  login: (token: string, userData: { userId: string; name: string }) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialAuthState: AuthState = {
  token: null,
  user: { userId: null, name: null },
};

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUserId = localStorage.getItem('authUserId');
    const storedName = localStorage.getItem('authName');
    if (storedToken && storedUserId && storedName) {
      return { token: storedToken, user: { userId: storedUserId, name: storedName } };
    }
    return initialAuthState;
  });

  useEffect(() => {
    if (auth.token && auth.user.userId && auth.user.name) {
      localStorage.setItem('authToken', auth.token);
      localStorage.setItem('authUserId', auth.user.userId);
      localStorage.setItem('authName', auth.user.name);
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
    } else {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUserId');
      localStorage.removeItem('authName');
      delete apiClient.defaults.headers.common['Authorization'];
    }
  }, [auth]);

  const login = (token: string, userData: { userId: string; name: string }) => {
    setAuth({ token, user: userData });
  };

  const logout = () => {
    setAuth(initialAuthState);
  };

  const value = {
    auth, 
    isAuthenticated: !!auth.token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};