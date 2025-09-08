import React from 'react';
import { ChevronLeft } from 'lucide-react';
import useAuthNavigation from '../../auth/hooks/useAuthNavigation';

const NotFoundPage: React.FC = () => {
  const { goBack } = useAuthNavigation();

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 relative">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Page not found</p>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>

      {/* small screens (< md): absolute button 30px below the container (aligned with right-6) */}
      <button
        type="button"
        onClick={goBack}
        aria-label="Back to homepage"
        className="absolute right-6 flex items-center gap-2 text-gray-700 md:hidden"
        style={{ top: 'calc(100% + 30px)' }}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="text-sm">Back</span>
      </button>

      {/* md+: fixed top-left, hidden on small screens */}
      <button
        type="button"
        onClick={goBack}
        aria-label="Back to homepage"
        className="hidden md:flex fixed left-3 top-3 z-50 items-center gap-2 p-2 md:p-3 rounded-md text-gray-700 hover:bg-white/5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
      >
        <ChevronLeft className="h-5 w-5" />
        <span className="text-sm">Back</span>
      </button>
    </div>
  );
};

export default NotFoundPage;
