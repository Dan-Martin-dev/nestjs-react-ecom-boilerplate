import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useMe } from '../hooks/useAuthNew';
import { apiClient } from '../lib/apiClient';
import { AuthContext } from './AuthContextDef';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { user, isAuthenticated, setUser, setLoading, isLoading } = useAuthStore();
  
  const { data: userData, isLoading: userLoading, error } = useMe();

  // Set user data from query when available
  useEffect(() => {
    if (userData && !user) {
      setUser(userData);
    }
  }, [userData, user, setUser]);

  // Clear user data if there's an authentication error
  useEffect(() => {
    if (error) {
      setUser(null);
      apiClient.clearToken();
    }
  }, [error, setUser]);

  // Set loading state
  useEffect(() => {
    setLoading(userLoading);
  }, [userLoading, setLoading]);

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,
        user,
        isLoading: isLoading || userLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
