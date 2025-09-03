import React from 'react';
import { Link } from 'react-router-dom';
import { useRegisterForm } from '../hooks';
import { Progress, Switch } from '@mantine/core';
import { EyeIcon, EyeOffIcon, UserPlusIcon } from 'lucide-react';
import '../styles/auth-fonts.css';


// Password strength indicators
const PasswordStrength = {
  Weak: 'weak',
  Medium: 'medium',
  Strong: 'strong',
  VeryStrong: 'very-strong'
} as const;

const RegisterPage: React.FC = () => {
  const {
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
    isSubmitting,

    // Actions
    handleSubmit,
  } = useRegisterForm();

  // Password strength progress color
  const getStrengthColor = () => {
    if (strengthScore < 30) return 'red';
    if (strengthScore < 60) return 'yellow';
    if (strengthScore < 80) return 'blue';
    return 'green';
  };

  return (
    <main className="max-w-md mx-auto py-12 px-4 auth-font-inco auth-uppercase">
      <h1 className="text-2xl font-inco font-semibold text-gray-900 mb-4">Create account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name field */}
        <label className="block">
          <span className="text-sm font-inco font-medium text-gray-700">Full Name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 px-3 py-2 font-inco text-sm text-gray-800 ${
              errors.name ? 'border-red-500' : ''
            }`}
            disabled={isSubmitting}
            autoComplete="name"
          />
          {errors.name && (
            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
          )}
        </label>

        {/* Email field */}
        <label className="block">
          <span className="text-sm font-inco font-medium text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 px-3 py-2 font-inco text-sm text-gray-800 ${
              errors.email ? 'border-red-500' : ''
            }`}
            disabled={isSubmitting}
            autoComplete="email"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </label>

        {/* Password field with strength indicator */}
        <div className="relative">
          <label className="block">
            <span className="text-sm font-inco font-medium text-gray-700">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full rounded-md border-gray-300 px-3 py-2 pr-10 font-inco text-sm text-gray-800 ${
                  errors.password ? 'border-red-500' : ''
                }`}
                disabled={isSubmitting}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 top-1 pr-3 flex items-center text-gray-400"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </label>

          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}

          {/* Password strength indicator */}
          {password && (
            <div className="mt-2">
              <Progress
                value={strengthScore}
                color={getStrengthColor()}
                size="xs"
                radius="xs"
              />
              <p className={`text-xs mt-1 font-tico ${
                passwordStrength === PasswordStrength.Weak ? 'text-red-500' :
                passwordStrength === PasswordStrength.Medium ? 'text-yellow-500' :
                passwordStrength === PasswordStrength.Strong ? 'text-blue-500' :
                'text-green-500'
              }`}>
                {passwordStrength === PasswordStrength.Weak && 'Weak password - try adding numbers and special characters'}
                {passwordStrength === PasswordStrength.Medium && 'Medium strength - add more variety for a stronger password'}
                {passwordStrength === PasswordStrength.Strong && 'Strong password - good job!'}
                {passwordStrength === PasswordStrength.VeryStrong && 'Very strong password - excellent!'}
              </p>
            </div>
          )}
        </div>

        {/* Confirm password field */}
        <label className="block">
          <span className="text-sm font-inco font-medium text-gray-700">Confirm password</span>
          <input
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`mt-1 block w-full rounded-md border-gray-300 px-3 py-2 font-inco text-sm text-gray-800 ${
              errors.confirmPassword ? 'border-red-500' : ''
            }`}
            disabled={isSubmitting}
            autoComplete="new-password"
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
          )}
        </label>

        {/* Terms and conditions */}
        <div className="flex items-center">
          <Switch
            checked={acceptTerms}
            onChange={(event) => setAcceptTerms(event.currentTarget.checked)}
            label={<span className="font-inco text-sm text-gray-700">I accept the terms and conditions</span>}
            color="dark"
            size="sm"
          />
        </div>
        {errors.terms && (
          <p className="text-red-500 text-xs">{errors.terms}</p>
        )}

        <div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 disabled:opacity-60 w-full font-inco font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 animate-spin">⏳</span>
                Creating Account...
              </>
            ) : (
              <>
                <UserPlusIcon className="h-4 w-4 mr-2" />
                Create account
              </>
            )}
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm font-inco text-gray-700">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 font-inco font-medium underline">
          Sign in
        </Link>
      </p>
    </main>
  );
};

export default RegisterPage;
