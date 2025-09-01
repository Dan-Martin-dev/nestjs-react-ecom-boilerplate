import React, { useState } from 'react';
import { notifications } from '@mantine/notifications';

interface TwoFactorAuthFormProps {
  onVerify: (code: string) => Promise<boolean>;
  onCancel: () => void;
}

const TwoFactorAuthForm: React.FC<TwoFactorAuthFormProps> = ({ onVerify, onCancel }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  // Handle input change and auto-focus next field
  const handleChange = (index: number, value: string) => {
    if (value.length > 1) {
      // If user pastes a multi-digit value
      const digits = value.split('').slice(0, 6);
      const newCode = [...code];
      
      digits.forEach((digit, i) => {
        if (index + i < 6) {
          newCode[index + i] = digit;
        }
      });
      
      setCode(newCode);
      
      // Focus on next empty input or last input
      const nextEmptyIndex = newCode.findIndex(val => val === '');
      if (nextEmptyIndex !== -1) {
        inputRefs.current[nextEmptyIndex]?.focus();
      } else {
        inputRefs.current[5]?.focus();
      }
    } else {
      // Normal single-digit input
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Auto-focus next input
      if (value !== '' && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  // Handle backspace key
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && code[index] === '' && index > 0) {
      // Focus previous input on backspace when current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join('');
    
    if (fullCode.length !== 6) {
      setError('Please enter all 6 digits of your verification code');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const success = await onVerify(fullCode);
      
      if (!success) {
        setError('Invalid verification code. Please try again.');
      }
    } catch (err) {
      console.error('2FA verification failed:', err);
      setError('Failed to verify code. Please try again.');
      notifications.show({
        title: 'Verification Failed',
        message: 'Unable to verify your code. Please try again.',
        color: 'red'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Two-Factor Authentication</h2>
      <p className="text-gray-600 mb-4">
        Please enter the 6-digit verification code from your authenticator app.
      </p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2">
          {code.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-md focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              disabled={isSubmitting}
              autoFocus={index === 0}
            />
          ))}
        </div>
        
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </div>
      </form>
      
      <div className="mt-4 text-sm text-gray-500">
        <p>Didn't receive a code? Check your authenticator app.</p>
        <button 
          className="text-blue-600 underline mt-1" 
          onClick={() => {
            notifications.show({
              title: 'Help',
              message: 'Please contact support if you cannot access your authenticator app.',
              color: 'blue'
            });
          }}
        >
          Need help?
        </button>
      </div>
    </div>
  );
};

export default TwoFactorAuthForm;
