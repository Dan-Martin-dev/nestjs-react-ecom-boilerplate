import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegister, useIsAuthenticated } from '../../../hooks/useAuth';
import { notifications } from '@mantine/notifications';

// Password strength indicators
const PasswordStrength = {
  Weak: 'weak',
  Medium: 'medium',
  Strong: 'strong',
  VeryStrong: 'very-strong'
} as const;

type PasswordStrengthType = typeof PasswordStrength[keyof typeof PasswordStrength];

interface UseRegisterFormReturn {
  // Form state
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  confirmPassword: string;
  setConfirmPassword: (confirmPassword: string) => void;
  showPassword: boolean;
  setShowPassword: (showPassword: boolean) => void;
  acceptTerms: boolean;
  setAcceptTerms: (acceptTerms: boolean) => void;

  // Validation state
  errors: { [key: string]: string };
  passwordStrength: PasswordStrengthType | null;
  strengthScore: number;

  // UI state
  isSubmitting: boolean;

  // Actions
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  validateForm: () => boolean;
  handleSocialLogin: (provider: 'google' | 'facebook' | 'instagram') => void;
}

export const useRegisterForm = (): UseRegisterFormReturn => {
  const navigate = useNavigate();
  const isAuthenticated = useIsAuthenticated();
  const registerMutation = useRegister();

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrengthType | null>(null);
  const [strengthScore, setStrengthScore] = useState(0);

  // Password strength calculation
  useEffect(() => {
    if (!password) {
      setPasswordStrength(null);
      setStrengthScore(0);
      return;
    }

    // Basic password strength calculation
    let score = 0;

    // Length check
    if (password.length > 5) score += 10;
    if (password.length > 8) score += 15;
    if (password.length > 12) score += 15;

    // Complexity checks
    if (/[A-Z]/.test(password)) score += 10; // Has uppercase
    if (/[a-z]/.test(password)) score += 10; // Has lowercase
    if (/[0-9]/.test(password)) score += 10; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 15; // Has special char

    // Variety check
    const uniqueChars = new Set(password.split('')).size;
    score += Math.min(uniqueChars * 2, 15); // More unique chars = better

    // Determine strength level
    setStrengthScore(Math.min(score, 100));

    if (score < 30) {
      setPasswordStrength(PasswordStrength.Weak);
    } else if (score < 60) {
      setPasswordStrength(PasswordStrength.Medium);
    } else if (score < 80) {
      setPasswordStrength(PasswordStrength.Strong);
    } else {
      setPasswordStrength(PasswordStrength.VeryStrong);
    }
  }, [password]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (strengthScore < 30) {
      newErrors.password = 'Password is too weak';
    }

    // Confirm password
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Terms acceptance
    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await registerMutation.mutateAsync({
        email,
        password,
        name,
        confirmPassword
      });

      notifications.show({
        title: 'Registration Successful',
        message: 'Your account has been created. Welcome!',
        color: 'green'
      });

      navigate('/', { replace: true });
    } catch (error) {
      // Error is handled by the mutation via notifications
      console.error('Registration failed:', error);
    }
  };

  // Handle social login (redirect to backend OAuth endpoint)
  const handleSocialLogin = (provider: 'google' | 'facebook' | 'instagram') => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5555';
    // backend route expects /auth/:provider
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  return {
    // Form state
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword,
    setShowPassword,
    acceptTerms,
    setAcceptTerms,

    // Validation state
    errors,
    passwordStrength,
    strengthScore,

    // UI state
    isSubmitting: registerMutation.isPending,

    // Actions
    handleSubmit,
    handleSocialLogin,
    validateForm,
  };
};
