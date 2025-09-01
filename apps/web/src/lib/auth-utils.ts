import type { AuthResponse, LoginDto } from '@repo/shared';
import { apiClient } from './api';

// This is a simulated backend rate limiter
// In a real implementation, this would be handled by your backend
class RateLimiter {
  private attempts: Map<string, { count: number, timestamp: number }> = new Map();
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_TIME = 60 * 1000; // 1 minute
  
  isRateLimited(key: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt) return false;
    
    // If lockout time has passed, reset the counter
    if (now - attempt.timestamp > this.LOCKOUT_TIME) {
      this.attempts.delete(key);
      return false;
    }
    
    return attempt.count >= this.MAX_ATTEMPTS;
  }
  
  recordAttempt(key: string): void {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt) {
      this.attempts.set(key, { count: 1, timestamp: now });
      return;
    }
    
    // If lockout time has passed, reset the counter
    if (now - attempt.timestamp > this.LOCKOUT_TIME) {
      this.attempts.set(key, { count: 1, timestamp: now });
      return;
    }
    
    this.attempts.set(key, { 
      count: attempt.count + 1, 
      timestamp: now 
    });
  }
  
  getRemainingAttempts(key: string): number {
    const attempt = this.attempts.get(key);
    if (!attempt) return this.MAX_ATTEMPTS;
    return Math.max(0, this.MAX_ATTEMPTS - attempt.count);
  }
  
  getLockoutRemaining(key: string): number {
    const now = Date.now();
    const attempt = this.attempts.get(key);
    
    if (!attempt || attempt.count < this.MAX_ATTEMPTS) return 0;
    
    const timeElapsed = now - attempt.timestamp;
    const timeRemaining = Math.max(0, this.LOCKOUT_TIME - timeElapsed);
    return Math.ceil(timeRemaining / 1000); // Return seconds
  }
}

// Create a singleton rate limiter instance
export const authRateLimiter = new RateLimiter();

// Utility for enhanced login functionality
export const enhancedLogin = async (
  credentials: LoginDto & { rememberMe?: boolean }
): Promise<AuthResponse> => {
  const { email } = credentials;
  
  // Check rate limiting before attempting login
  if (authRateLimiter.isRateLimited(email)) {
    const lockoutRemaining = authRateLimiter.getLockoutRemaining(email);
    throw new Error(`Too many login attempts. Try again in ${lockoutRemaining} seconds.`);
  }
  
  try {
    // Call actual login API
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    
    // Handle "Remember Me" functionality
    if (credentials.rememberMe && response.refresh_token) {
      localStorage.setItem('remembered_email', email);
      
      // In a real implementation, you might set a longer expiration on tokens
      // when "remember me" is checked. This would be handled by the backend.
    }
    
    return response;
  } catch (error) {
    // Record failed attempt for rate limiting
    authRateLimiter.recordAttempt(email);
    
    // Re-throw the error for handling in UI
    throw error;
  }
};

// Simulate two-factor authentication
// In a real implementation, this would be integrated with your backend
export const verifyTwoFactorCode = async (
  code: string, 
  userId?: string
): Promise<boolean> => {
  // Simulate API call for 2FA verification
  console.log('Verifying 2FA code for user:', userId);
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // For demo purposes, any 6-digit code starting with '123' will be valid
  return code.length === 6 && code.startsWith('123');
};
