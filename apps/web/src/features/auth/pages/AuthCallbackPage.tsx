import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../../stores/auth.store';
import { apiClient } from '../../../lib/api';
import { notifications } from '@mantine/notifications';
import { Loader, Center, Text } from '@mantine/core';

const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');
    const error = searchParams.get('error');

    if (error) {
      notifications.show({
        title: 'Authentication Failed',
        message: `Failed to authenticate with ${provider}. Please try again.`,
        color: 'red',
      });
      navigate('/login');
      return;
    }

    if (token) {
      // Set token in the API client (this also persists to localStorage under the app key)
      apiClient.setToken(token);

      // Decode token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.sub,
          email: payload.email,
          name: payload.name || 'User',
          role: payload.role || 'CUSTOMER',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }

      notifications.show({
        title: 'Welcome!',
        message: `Successfully signed in with ${provider}`,
        color: 'green',
      });

  // After social sign-in, go to the main page (root) so user-specific queries load
  navigate('/', { replace: true });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setUser, setLoading]);

  return (
    <Center style={{ height: '100vh' }}>
      <div style={{ textAlign: 'center' }}>
        <Loader size="lg" />
        <Text mt="md" size="lg">
          Completing authentication...
        </Text>
        <Text mt="sm" color="dimmed">
          Please wait while we finish signing you in.
        </Text>
      </div>
    </Center>
  );
};

export default AuthCallbackPage;
