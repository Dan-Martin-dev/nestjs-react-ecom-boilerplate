export interface RegisterValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export function validateRegister(values: RegisterValues, strengthScore: number) {
  const { name, email, password, confirmPassword, acceptTerms } = values;
  const errors: Record<string, string> = {};

  if (!name.trim()) {
    errors.name = 'Name is required';
  }

  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Please enter a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (strengthScore < 30) {
    errors.password = 'Password is too weak';
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  if (!acceptTerms) {
    errors.terms = 'You must accept the terms and conditions';
  }

  const ok = Object.keys(errors).length === 0;
  return { ok, errors };
}
