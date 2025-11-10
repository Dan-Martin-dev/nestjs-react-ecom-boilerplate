import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  User,
  MapPin,
  LogOut,
  Menu,
  Package2,
  ChevronLeft
} from 'lucide-react';
import { useAuthStore } from '../../../stores';
import { notify } from '../../../lib/notify';
import { Button } from '../../../components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../../../components/ui/sheet';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';

const DashboardLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAuth();
    notify.success('Logged out successfully');
    navigate('/auth/login');
  };

  const navigationItems = [
    {
      name: 'Overview',
      path: '/dashboard',
      icon: Home
    },
    {
      name: 'Orders',
      path: '/dashboard/orders',
      icon: ShoppingCart
    },
    {
      name: 'Account',
      path: '/dashboard/account',
      icon: User
    },
    {
      name: 'Addresses',
      path: '/dashboard/addresses',
      icon: MapPin
    }
  ];

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden border-r bg-background lg:block lg:w-64">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <NavLink to="/dashboard" className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span className="">Dashboard</span>
            </NavLink>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      isActive
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`
                  }
                  end={item.path === '/dashboard'}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Separator className="mb-4" />
            <div className="flex items-center gap-3 mb-4">
              <Avatar className="h-9 w-9">
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium leading-none truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground mt-1"
              onClick={() => navigate('/')}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Store
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6 lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <NavLink
                  to="/dashboard"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package2 className="h-6 w-6" />
                  <span>Dashboard</span>
                </NavLink>
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                        isActive
                          ? 'bg-muted text-foreground'
                          : 'text-muted-foreground'
                      }`
                    }
                    end={item.path === '/dashboard'}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>
              <div className="mt-auto">
                <Separator className="mb-4" />
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium leading-none truncate">{user?.name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground mt-1"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    navigate('/');
                  }}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back to Store
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1">
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
