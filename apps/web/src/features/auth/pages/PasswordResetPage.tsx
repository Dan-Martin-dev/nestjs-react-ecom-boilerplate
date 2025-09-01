import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { notifications } from '@mantine/notifications';

// Simulating API functions
const requestPasswordReset = async (email: string): Promise<boolean> => {
  // In a real implementation, this would call your API
  console.log('Requesting password reset for:', email);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
  return true;
};

const PasswordResetPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      notifications.show({
        title: 'Error',
        message: 'Please enter your email address',
        color: 'red'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await requestPasswordReset(email);
      setIsSubmitted(true);
      notifications.show({
        title: 'Success',
        message: 'If your email exists in our system, you will receive a password reset link shortly.',
        color: 'green'
      });
    } catch (error) {
      console.error('Password reset failed:', error);
      notifications.show({
        title: 'Error',
        message: 'Something went wrong. Please try again later.',
        color: 'red'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="max-w-md mx-auto py-12 px-4">
      <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
      
      {!isSubmitted ? (
        <>
          <p className="text-gray-600 mb-4">
            Enter the email address associated with your account and we'll send you a link to reset your password.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium">Email address</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2"
                required
                disabled={isSubmitting}
              />
            </label>
            
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded bg-black text-white px-4 py-2 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>
        </>
      ) : (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-green-800 mb-1">Check your email</h2>
          <p className="text-green-700">
            If {email} is associated with an account, you will receive a password reset link shortly.
          </p>
        </div>
      )}
      
      <p className="mt-6 text-sm text-gray-700">
        Remember your password?{' '}
        <Link to="/login" className="text-blue-600 underline">
          Sign in
        </Link>
      </p>
    </main>
  );
};

export default PasswordResetPage;
