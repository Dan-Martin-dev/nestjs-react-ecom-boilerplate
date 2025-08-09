import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { MantineProvider } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'

// Layout
import { RootLayout } from './features/layout/components/RootLayout'

// Pages
import { HomePage } from './features/home/pages/HomePage'
import { ProductsPage } from './features/products/pages/ProductsPage'
import { ProductDetailPage } from './features/products/pages/ProductDetailPage'
import { CartPage } from './features/cart/pages/CartPage'
import AuthLoginPage from './features/auth/pages/AuthLoginPage'
import { AuthRegisterPage } from './features/auth/pages/AuthRegisterPage'
import { DashboardPage } from './features/dashboard/pages/DashboardPage'
import { NotFoundPage } from './features/layout/pages/NotFoundPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <ModalsProvider>
          <Notifications />
          <Router>
            <Routes>
              <Route path="/" element={<RootLayout />}>
                <Route index element={<HomePage />} />
                <Route path="products" element={<ProductsPage />} />
                <Route path="products/:productId" element={<ProductDetailPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="auth/login" element={<AuthLoginPage />} />
                <Route path="auth/register" element={<AuthRegisterPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Router>
        </ModalsProvider>
      </MantineProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
