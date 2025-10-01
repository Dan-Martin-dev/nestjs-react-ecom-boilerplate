/**
 * Application configuration
 * This file contains environment-specific configuration for the web application
 */

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

// App Configuration
export const APP_CONFIG = {
  api: {
    baseUrl: API_URL,
    timeout: 10000,
  },
  features: {
    enableDevTools: import.meta.env.DEV,
  },
} as const;

// Type-safe environment validation
export function validateEnvironment() {
  const requiredEnvVars = ['VITE_API_URL'];

  const missing = requiredEnvVars.filter(envVar => !import.meta.env[envVar]);

  if (missing.length > 0) {
    console.warn(`Missing environment variables: ${missing.join(', ')}`);
    console.warn('Using default values. Make sure to set these in production.');
  }
}

// Validate environment on module load
validateEnvironment();
