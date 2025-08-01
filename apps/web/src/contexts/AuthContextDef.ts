import { createContext } from 'react';
import type { User } from '../types/api';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
