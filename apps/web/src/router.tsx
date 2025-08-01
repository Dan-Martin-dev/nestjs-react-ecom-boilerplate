import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { RootLayout } from './features/layout/components/RootLayout'
import { HomePage } from './features/home/pages/HomePage'
import { ProductsPage } from './features/products/pages/ProductsPage'
import { ProductDetailPage } from './features/products/pages/ProductDetailPage'
import { CartPage } from './features/cart/pages/CartPage'
import { AuthLoginPage } from './features/auth/pages/AuthLoginPage'
import { AuthRegisterPage } from './features/auth/pages/AuthRegisterPage'
import { DashboardPage } from './features/dashboard/pages/DashboardPage'
import { NotFoundPage } from './features/layout/pages/NotFoundPage'

// Root route
const rootRoute = createRootRoute({
  component: () => (
    <>
      <RootLayout />
      <TanStackRouterDevtools />
    </>
  ),
})

// Index route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
})

// Products routes
const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
})

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$productId',
  component: ProductDetailPage,
})

// Cart route
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/cart',
  component: CartPage,
})

// Auth routes
const authLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/login',
  component: AuthLoginPage,
})

const authRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/auth/register',
  component: AuthRegisterPage,
})

// Dashboard route (protected)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
})

// Not found route
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
})

// Route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  productDetailRoute,
  cartRoute,
  authLoginRoute,
  authRegisterRoute,
  dashboardRoute,
  notFoundRoute,
])

// Create router
export const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
