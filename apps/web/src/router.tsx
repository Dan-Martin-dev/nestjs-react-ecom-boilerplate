import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './features/layout/pages/RootLayoutV6';
import AuthLayout from './features/layout/pages/AuthLayout';
import ProductsLayout from './features/layout/pages/ProductsLayout';
import CartLayout from './features/layout/pages/CartLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import Loadable from './utils/Loadable';

const ProductsPage = lazy(() => import('./features/products/pages/ProductsPage'));
const CartPage = lazy(() => import('./features/cart/pages/CartPage'));
const ProductDetailPage = lazy(() => import('./features/products/pages/ProductDetailPage'));
const NotFoundPage = lazy(() => import('./features/layout/pages/NotFoundPage'));
// Uncomment if these pages exist
// const HomePage = lazy(() => import('./features/layout/pages/HomePage'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const AuthCallbackPage = lazy(() => import('./features/auth/pages/AuthCallbackPage'));


const router = createBrowserRouter([

  // RootLayout (header/footer)
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Index route -> home (products listing)
      {
        index: true,
        element: (
          <Loadable>
            <ProductsPage />
          </Loadable>
        ),
      },

      // Product routes grouped under ProductsLayout for future filters/sidebars
      {
        path: 'products',
        element: <ProductsLayout />,
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

]);

export { router };
