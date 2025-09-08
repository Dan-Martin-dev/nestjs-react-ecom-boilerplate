import { useNavigate, useLocation } from 'react-router-dom';

interface FromState { from?: { pathname?: string } }

export function useAuthNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const getFrom = () => {
    const state = location.state as unknown;
    if (typeof state === 'object' && state !== null && 'from' in (state as Record<string, unknown>)) {
      const s = state as FromState;
      return s.from?.pathname ?? '/';
    }
    return '/';
  };

  // Navigate back to the main page (root) instead of the previous page
  const goBack = () => {
    navigate('/', { replace: true });
  };

  return { goBack, from: getFrom() };
}

export default useAuthNavigation;
