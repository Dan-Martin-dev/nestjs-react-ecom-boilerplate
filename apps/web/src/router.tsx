import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './features/layout/components/RootLayoutV6';
import { ErrorBoundary } from './components/ErrorBoundary';

const ProductsPage = lazy(() => import('./features/products/pages/ProductsPage'));
const CartPage = lazy(() => import('./features/cart/pages/CartPage'));
const ProductDetailPage = lazy(() => import('./features/products/pages/ProductDetailPage'));
const NotFoundPage = lazy(() => import('./features/layout/pages/NotFoundPage'));
// Uncomment if these pages exist
// const HomePage = lazy(() => import('./features/layout/pages/HomePage'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Uncomment if HomePage exists
      // { path: '', element: <Suspense fallback={<div>Loading...</div>}><HomePage /></Suspense> },
      { 
        path: '', 
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center">Loading products...</div>}>
              <ProductsPage />
            </Suspense>
          </ErrorBoundary>
        )
      },
      {
        path: 'products',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center">Loading products...</div>}>
              <ProductsPage />
            </Suspense>
          </ErrorBoundary>
        )
      },
      {
        path: 'products/:productId',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center">Loading product details...</div>}>
              <ProductDetailPage />
            </Suspense>
          </ErrorBoundary>
        )
      },
      {
        path: 'cart',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center">Loading cart...</div>}>
              <CartPage />
            </Suspense>
          </ErrorBoundary>
        )
      },
      {
        path: 'login',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
              <LoginPage />
            </Suspense>
          </ErrorBoundary>
        )
      },
      {
        path: 'register',
        element: (
          <ErrorBoundary>
            <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
              <RegisterPage />
            </Suspense>
          </ErrorBoundary>
        )
      },
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
    ],
  },
]);

export { router };
