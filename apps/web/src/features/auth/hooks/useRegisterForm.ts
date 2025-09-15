import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegister, useIsAuthenticated } from '../../../hooks/useAuth';
import { notify, formatApiError } from '../../../lib/notify'
import { computePasswordStrength } from './usePasswordStrength';
import { validateRegister } from './validateRegister';
import type { RegisterValues } from './validateRegister';
import { redirectToSocial } from './useSocialLogin';

type PasswordStrengthType = 'weak' | 'medium' | 'strong' | 'very-strong' | null;

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

  // Password strength calculation (extracted)
  useEffect(() => {
    const { score, label } = computePasswordStrength(password);
    setStrengthScore(score);
    setPasswordStrength(label as PasswordStrengthType);
  }, [password]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const validateForm = useCallback((): boolean => {
    const values: RegisterValues = { name, email, password, confirmPassword, acceptTerms };
    const { ok, errors: newErrors } = validateRegister(values, strengthScore);
    setErrors(newErrors);
    if (!ok) {
      const summary = Object.values(newErrors)[0] || 'Please fix the highlighted fields';
      notify.error(String(summary));
    }
    return ok;
  }, [name, email, password, confirmPassword, acceptTerms, strengthScore]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // prevent duplicate submits while mutation is pending
    if (registerMutation.isPending) return;

    try {
      await registerMutation.mutateAsync({
        email,
        password,
        name,
        confirmPassword,
      });

      // show success toast then wait briefly so user can see it before redirect
      notify.success('Registration successful — welcome!');
      await new Promise((res) => setTimeout(res, 600));
      navigate('/', { replace: true });
    } catch (error) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        notify.error('Network error. Check your connection.');
      } else {
        notify.error(formatApiError(error));
      }
      console.error('Registration failed:', error);
    }
  }, [email, password, name, confirmPassword, registerMutation, navigate, validateForm]);

  // Handle social login (redirect to backend OAuth endpoint)
  const handleSocialLogin = useCallback((provider: 'google' | 'facebook' | 'instagram') => {
    redirectToSocial(provider);
  }, []);

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
