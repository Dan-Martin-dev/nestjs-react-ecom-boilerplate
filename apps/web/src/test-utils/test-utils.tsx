import { render } from '@testing-library/react'
import type { RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, MemoryRouter, Routes, Route } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { vi } from 'vitest'
import type { Mock } from 'vitest'
import * as authStoreModule from '../stores/auth.store'

// Create module mock functions
// Note: This MUST be before the test-utils code, not inside a function
vi.mock('../hooks/useCart', () => ({
  useCart: () => ({ data: { items: [] } }),
  cartKeys: { detail: () => ['cart'] },
}))

// Configure jsdom matchMedia for tests
const setupMatchMedia = () => {
  type WindowWithMatchMedia = Window & {
    matchMedia: (query: string) => MediaQueryList
  }

  const win = window as unknown as WindowWithMatchMedia
  if (typeof win.matchMedia !== 'function') {
    win.matchMedia = (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList)
  }
}

// Create a fresh QueryClient for each test
export const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
      networkMode: 'always',
    },
    mutations: {
      retry: false,
      networkMode: 'always',
    },
  },
})

// Setup authentication store mock
interface AuthMockOptions {
  isAuthenticated?: boolean
  user?: null | Record<string, unknown>
}

export const mockAuthStore = (options: AuthMockOptions = {}) => {
  const { isAuthenticated = false, user = null } = options
  const logout = vi.fn().mockResolvedValue(undefined)
  
  // The mocked default export is a function that receives a selector
  const mockedStore = authStoreModule.default as unknown as Mock
  
  mockedStore.mockImplementation((selector: (s: unknown) => unknown) =>
    selector({ isAuthenticated, logout, user })
  )
  
  return { logout }
}

// Wrapper for all providers needed in tests
interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  queryClient?: QueryClient
  auth?: AuthMockOptions
  useMemoryRouter?: boolean
  initialEntries?: string[]
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    route = '/',
    queryClient = createQueryClient(),
    auth,
    useMemoryRouter = false,
    initialEntries = ['/'],
    ...renderOptions
  }: RenderWithProvidersOptions = {}
) {
  // Setup matchMedia for tests
  setupMatchMedia()
  
  // Mock auth store if auth options provided
  let authMock = undefined
  if (auth) {
    authMock = mockAuthStore(auth)
  }
  
  // Wrap providers around the component
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    const Router = useMemoryRouter ? MemoryRouter : BrowserRouter
    const routerProps = useMemoryRouter ? { initialEntries } : {}
    
    return (
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <Router {...routerProps}>
            {useMemoryRouter ? (
              <Routes>
                <Route path={route} element={children} />
              </Routes>
            ) : (
              children
            )}
          </Router>
        </MantineProvider>
      </QueryClientProvider>
    )
  }
  
  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    authMock
  }
}
