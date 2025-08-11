import { createBrowserRouter } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { RootLayout } from './features/layout/components/RootLayoutV6';
import { HomePage } from './features/home/pages/HomePage';
import { ProductsPage } from './features/products/pages/ProductsPage';
import { ProductDetailPage } from './features/products/pages/ProductDetailPage';
import { CartPage } from './features/cart/pages/CartPage';
import AuthLoginPage from './features/auth/pages/AuthLoginPage';
import { AuthRegisterPage } from './features/auth/pages/AuthRegisterPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { NotFoundPage } from './features/layout/pages/NotFoundPage';

// Define routes as objects
const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'products',
        element: <ProductsPage />,
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'auth/login',
        element: <AuthLoginPage />,
      },
      {
        path: 'auth/register',
        element: <AuthRegisterPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
];

// Create router
export const router = createBrowserRouter(routes);
