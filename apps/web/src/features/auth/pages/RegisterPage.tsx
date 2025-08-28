import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      // Simulate request; replace with real API call
      await new Promise((r) => setTimeout(r, 700));
      localStorage.setItem('auth_token', 'demo-token');
      navigate('/', { replace: true });
    } catch {
      setError('Unable to register. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-4">Create account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="text-sm text-red-600">{error}</div>}

        <label className="block">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-medium">Confirm password</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
            required
          />
        </label>

        <div>
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-gray-700">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 underline">
          Sign in
        </Link>
      </p>
    </main>
  );
};

export default RegisterPage;
