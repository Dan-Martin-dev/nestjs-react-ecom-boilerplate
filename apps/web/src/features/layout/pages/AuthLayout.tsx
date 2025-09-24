import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ScrollToTop from '../../../components/ScrollToTop'

export const AuthLayout: React.FC = () => {
  const location = useLocation();

  // Auth-specific scroll handler to ensure login/register pages scroll to top
  // This provides an additional layer of scroll handling specific to auth pages
  useEffect(() => {
    // Force immediate scroll to top for auth pages
    const forceAuthScroll = () => {
      try {
        // Blur any focused elements (especially inputs) to dismiss mobile keyboard
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        
        // Scroll to top with all possible methods
        window.scrollTo({ top: 0, behavior: 'auto' });
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      } catch (e) {
        // Ignore errors
        void e;
      }
    };
    
    // Call immediately
    forceAuthScroll();
    
    // Call again after a delay to catch late renders
    setTimeout(forceAuthScroll, 100);
    
    // Add a more direct scroll trigger for page loads/reloads
    const handlePageLoad = () => setTimeout(forceAuthScroll, 50);
    window.addEventListener('load', handlePageLoad);
    document.addEventListener('DOMContentLoaded', handlePageLoad);
    
    return () => {
      window.removeEventListener('load', handlePageLoad);
      document.removeEventListener('DOMContentLoaded', handlePageLoad);
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Use forceOnReload for extra reliability on login/register pages */}
      <ScrollToTop forceOnReload={true} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

export default AuthLayout
