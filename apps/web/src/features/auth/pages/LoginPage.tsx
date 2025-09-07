import React from 'react';
import { Link } from 'react-router-dom';
import { useLoginForm } from '../hooks';
import { Switch } from '@mantine/core';
import { EyeIcon, EyeOffIcon, Lock } from 'lucide-react';
import { IconBrandGoogle, IconBrandFacebook, IconBrandInstagram } from '@tabler/icons-react';
import '../styles/auth-fonts.css';

const LoginPage: React.FC = () => {
  const {
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
    isSubmitting,
    isLocked,
    loginAttempts,

    // Actions
    handleSubmit,
    handleSocialLogin,
  } = useLoginForm();

  return (
    <main className="max-w-md mx-auto py-12 px-4 auth-font-inco auth-uppercase">
      <h1 className="text-2xl font-tico font-semibold text-gray-900 mb-4">Sign in</h1>

      {loginAttempts > 2 && loginAttempts < 5 && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
          <p className="text-sm">
            Warning: {5 - loginAttempts} login attempts remaining before temporary lockout.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm font-inco font-medium text-gray-700">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 font-inco text-sm text-gray-800"
            required
            disabled={isLocked || isSubmitting}
            autoComplete="email"
          />
        </label>

        <div className="relative">
          <label className="block">
            <span className="text-sm font-inco font-medium text-gray-700">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 pr-10 font-inco text-sm text-gray-800"
                required
                disabled={isLocked || isSubmitting}
                autoComplete="current-password"
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
        </div>

        <div className="flex items-center">
          <Switch
            checked={rememberMe}
            onChange={(event) => setRememberMe(event.currentTarget.checked)}
            label={<span className="font-inco text-sm text-gray-700">Remember me</span>}
            color="dark"
            size="sm"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 disabled:opacity-60 font-inco font-medium"
            disabled={isLocked || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="mr-2 animate-spin">⏳</span>
                Signing in…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Sign in
              </>
            )}
          </button>

          <Link to="/password-reset" className="text-sm font-inco text-gray-600">
            Forgot password?
          </Link>
        </div>
      </form>

      {/* Social login options */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

    <div className="mt-6 grid grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-inco font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <IconBrandGoogle size={18} />
            Google
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('facebook')}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-inco font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <IconBrandFacebook size={18} />
            Facebook
          </button>

          <button
            type="button"
            onClick={() => handleSocialLogin('instagram')}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-inco font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <IconBrandInstagram size={18} />
            Instagram
          </button>
        </div>
      </div>

      <p className="mt-6 text-sm font-inco text-gray-700">
        Don't have an account?{' '}
        <Link to="/auth/register" className="text-blue-600 font-inco font-medium underline">
          Create one
        </Link>
      </p>
    </main>
  );
};

export default LoginPage;
