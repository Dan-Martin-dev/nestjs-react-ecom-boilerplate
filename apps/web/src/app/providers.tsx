import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { queryClient } from '../lib/react-query';
import { mantineTheme } from './mantineTheme.ts';
import { useAuthStore } from '../stores';
import { useEffect } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const showDevtools = import.meta.env.VITE_ENABLE_DEVTOOLS === 'true' && import.meta.env.DEV;

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={mantineTheme} defaultColorScheme="auto">
        <ModalsProvider>
          <Notifications position="top-right" zIndex={1000} />
          {children}
        </ModalsProvider>
      </MantineProvider>
      {showDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
