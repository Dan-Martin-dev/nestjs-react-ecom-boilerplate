import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon, ShoppingCartIcon, UserIcon, MapPinIcon, LogOutIcon, MenuIcon, X 
} from 'lucide-react';
import { useAuthStore } from '../../../stores';
import { notify } from '../../../lib/notify';
import '../../auth/styles/auth-fonts.css';

const DashboardLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    notify.success('Logged out successfully');
    navigate('/auth/login');
  };

  // Navigation items for the sidebar
  const navigationItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: <HomeIcon className="w-5 h-5" />
    },
    {
      name: 'Orders',
      path: '/dashboard/orders',
      icon: <ShoppingCartIcon className="w-5 h-5" />
    },
    {
      name: 'Account',
      path: '/dashboard/account',
      icon: <UserIcon className="w-5 h-5" />
    },
    {
      name: 'Addresses',
      path: '/dashboard/addresses',
      icon: <MapPinIcon className="w-5 h-5" />
    }
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inco">
      {/* Mobile navigation toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm py-4 px-4 flex items-center justify-between">
        <h1 className="text-xl font-medium">Dashboard</h1>
        <button 
          onClick={toggleMobileMenu} 
          className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
          aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile navigation menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-20 bg-white pt-16">
          <nav className="p-6 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg ${
                    isActive 
                      ? 'bg-gray-100 text-gray-900 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                end={item.path === '/dashboard'}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50"
            >
              <LogOutIcon className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </nav>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:z-10 lg:w-64">
        <div className="flex flex-col flex-grow bg-white border-r shadow-sm">
          <div className="px-4 py-6">
            <h1 className="text-2xl font-medium text-gray-900">Dashboard</h1>
            {user?.name && (
              <p className="mt-1 text-sm text-gray-500">Welcome, {user.name}</p>
            )}
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-gray-100 text-gray-900 font-medium' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                end={item.path === '/dashboard'}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </NavLink>
            ))}
          </nav>
          
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 w-full"
            >
              <LogOutIcon className="w-5 h-5 mr-3" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`${isMobileMenuOpen ? 'hidden' : 'block'} lg:ml-64 pt-16 lg:pt-0`}>
        <main className="max-w-6xl mx-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
