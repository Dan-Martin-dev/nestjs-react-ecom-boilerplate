import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './features/layout/pages/RootLayoutV6';
import AuthLayout from './features/layout/pages/AuthLayout';
import CartLayout from './features/layout/pages/CartLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import Loadable from './utils/Loadable';
import ProtectedRoute from './features/auth/components/ProtectedRoute';

const ProductsPage = lazy(() => import('./features/products/pages/ProductsPage'));
const BestsellersPage = lazy(() => import('./features/bestsellers/pages/BestsellersPage'));
const CartPage = lazy(() => import('./features/cart/pages/CartPage'));
const ProductDetailPage = lazy(() => import('./features/products/pages/ProductDetailPage'));
const NotFoundPage = lazy(() => import('./features/layout/pages/NotFoundPage'));
// Uncomment if these pages exist
// const HomePage = lazy(() => import('./features/layout/pages/HomePage'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const AuthCallbackPage = lazy(() => import('./features/auth/pages/AuthCallbackPage'));

// Dashboard routes
const DashboardLayout = lazy(() => import('./features/dashboard/layouts/DashboardLayout'));
const DashboardOverviewPage = lazy(() => import('./features/dashboard/pages/DashboardOverviewPage'));
const AccountPage = lazy(() => import('./features/dashboard/pages/AccountPage'));
const OrdersPage = lazy(() => import('./features/dashboard/pages/OrdersPage'));
const AddressesPage = lazy(() => import('./features/dashboard/pages/AddressesPage'));


const router = createBrowserRouter([

  // RootLayout (header/footer)
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Index route -> home (bestsellers)
      {
        index: true,
        element: (
          <Loadable>
            <BestsellersPage />
          </Loadable>
        ),
      },

      // Product routes now use RootLayout (main layout with header/footer)
      {
        path: 'products',
        children: [
          {
            index: true,
            element: (
              <Loadable>
                <ProductsPage />
              </Loadable>
            )
          },
          {
            path: ':productId',
            element: (
              <Loadable fallback={<div className="p-8 text-center">Loading product details...</div>}>
                <ProductDetailPage />
              </Loadable>
            )
          }
        ]
      },

      // Cart/checkout grouped under CartLayout
      {
        path: 'cart',
        element: <CartLayout />,
        children: [
          {
            index: true,
            element: (
              <Loadable fallback={<div className="p-8 text-center">Loading cart...</div>}>
                <CartPage />
              </Loadable>
            )
          }
        ]
      },
      
  /* dashboard routes removed from RootLayout children
     (moved to top-level so they render without RootLayout header/footer) */

  // auth routes intentionally handled by a separate top-level route so
  // RootLayout (header/footer) does not render for auth pages.
      
    ],
  },

  // Top-level auth routes (render without RootLayout header/footer)
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
              <LoginPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'register',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
              <RegisterPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'callback',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
              <AuthCallbackPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
    ],
  },

  // Global not-found catch-all (top-level) so it doesn't shadow other top-level routes
  {
    path: '*',
    element: (
      <ErrorBoundary>
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <NotFoundPage />
        </Suspense>
      </ErrorBoundary>
    )
  },

  // Top-level dashboard routes (render without RootLayout header/footer)
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Loadable fallback={<div className="p-8 text-center">Loading dashboard...</div>}>
          <DashboardLayout />
        </Loadable>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Loadable>
            <DashboardOverviewPage />
          </Loadable>
        )
      },
      {
        path: 'account',
        element: (
          <Loadable>
            <AccountPage />
          </Loadable>
        )
      },
      {
        path: 'orders',
        element: (
          <Loadable>
            <OrdersPage />
          </Loadable>
        )
      },
      {
        path: 'addresses',
        element: (
          <Loadable>
            <AddressesPage />
          </Loadable>
        )
      }
    ]
  },

]);

export { router };
