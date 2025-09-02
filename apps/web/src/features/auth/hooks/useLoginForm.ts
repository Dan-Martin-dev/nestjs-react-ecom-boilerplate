import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin, useIsAuthenticated } from '../../../hooks/useAuth';
import { notifications } from '@mantine/notifications';

interface UseLoginFormReturn {
  // Form state
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  rememberMe: boolean;
  setRememberMe: (rememberMe: boolean) => void;
  showPassword: boolean;
  setShowPassword: (showPassword: boolean) => void;

  // UI state
  isSubmitting: boolean;
  isLocked: boolean;
  loginAttempts: number;
  lockTimer: number | null;

  // Actions
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleSocialLogin: (provider: 'google' | 'facebook' | 'instagram') => void;
}

export const useLoginForm = (): UseLoginFormReturn => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const loginMutation = useLogin();

  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Rate limiting state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimer, setLockTimer] = useState<number | null>(null);

  // Rate limiting: Check if account is locked
  useEffect(() => {
    if (loginAttempts >= 5 && !isLocked) {
      setIsLocked(true);
      const timer = window.setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
      }, 60000); // 1 minute lockout
      setLockTimer(timer);

      notifications.show({
        title: 'Account Temporarily Locked',
        message: 'Too many login attempts. Please try again in 1 minute.',
        color: 'red'
      });
    }

    return () => {
      if (lockTimer) clearTimeout(lockTimer);
    };
  }, [loginAttempts, isLocked, lockTimer]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Load remembered email
  useEffect(() => {
    const savedEmail = localStorage.getItem('remembered_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      notifications.show({
        title: 'Account Locked',
        message: 'Please wait before trying again',
        color: 'red'
      });
      return;
    }

    // Basic validation
    if (!email || !password) {
      notifications.show({
        title: 'Missing Information',
        message: 'Please enter both email and password',
        color: 'orange'
      });
      return;
    }

    try {
      await loginMutation.mutateAsync({
        email,
        password,
        // In a real implementation, you would pass rememberMe to extend token expiration
      });

      // Remember me functionality - store in localStorage
      if (rememberMe) {
        localStorage.setItem('remembered_email', email);
      } else {
        localStorage.removeItem('remembered_email');
      }

      navigate('/', { replace: true });
    } catch (error) {
      // Increment login attempts for rate limiting
      setLoginAttempts(prev => prev + 1);
      // Error is handled by the mutation and shows via notifications
      console.error('Login failed:', error);
    }
  };

  // Handle social login
  const handleSocialLogin = (provider: 'google' | 'facebook' | 'instagram') => {
    // Redirect to backend OAuth endpoint
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5555';
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return {
    // Form state
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    showPassword,
    setShowPassword,

    // UI state
    isSubmitting: loginMutation.isPending,
    isLocked,
    loginAttempts,
    lockTimer,

    // Actions
    handleSubmit,
    handleSocialLogin,
  };
};
