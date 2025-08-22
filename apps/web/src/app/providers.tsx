import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications, showNotification } from '@mantine/notifications';
import { queryClient } from '../lib/react-query';
import { mantineTheme } from './mantineTheme.ts';
import { useAuthStore } from '../stores';
import { useEffect, useRef } from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  // Check authentication on app start
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Centralized listener for app-level notification events (dispatched by api client)
  const seenNotificationCodes = useRef<Set<string>>(new Set());
  useEffect(() => {
    type AppNotifyDetail = {
      title?: string;
      message?: string;
      color?: 'blue' | 'teal' | 'green' | 'red' | 'orange' | string;
      code?: string;
      duration?: number;
    };

    const handler = (e: Event) => {
      const custom = e as CustomEvent<AppNotifyDetail>;
      const detail = custom?.detail || {};
      const title = detail.title || '';
      const message = detail.message || '';
      const color = detail.color as 'blue' | 'teal' | 'green' | 'red' | 'orange' | undefined;
      const code = detail.code as string | undefined;
      const duration = typeof detail.duration === 'number' ? detail.duration : 5000;

      // Ignore session-expired notifications here (prevent toast shown near footer)
      if (code === 'session-expired') {
        // Optionally handle session-expired differently (modal, redirect) later
        console.debug('[app:notify] session-expired received - suppressed toast')
        return
      }

      // If a code is provided, avoid showing the same notification twice per session
      if (code) {
        if (seenNotificationCodes.current.has(code)) return;
        seenNotificationCodes.current.add(code);
      }

      showNotification({
        title,
        message,
        color,
        autoClose: duration,
      });
    };

    window.addEventListener('app:notify', handler as EventListener);
    return () => window.removeEventListener('app:notify', handler as EventListener);
  }, []);

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
