import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import type { Mock } from 'vitest'
import { Header } from '../Header'
import * as authStoreModule from '../../../../stores/auth.store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'

// Mock cart hook
vi.mock('../../../../hooks/useCart', () => ({
  useCart: () => ({ data: { items: [] } }),
  cartKeys: { detail: () => ['cart'] },
}))

// Mock analytics
vi.mock('../../../../lib/analytics', () => ({
  trackEvent: vi.fn(),
}))

// Mock auth store
vi.mock('../../../../stores/auth.store', () => ({
  default: vi.fn(),
}))

// Configure jsdom matchMedia for tests
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

describe('Header auth interactions', () => {
  it('shows SIGN OUT and calls logout when confirmed', async () => {
    const logoutMock = vi.fn().mockResolvedValue(undefined)
    
    // Setup mock store to return isAuthenticated true
    // Mock selector-style zustand store
    const mockedStore = (authStoreModule.default as unknown as Mock)
    mockedStore.mockImplementation((selector: (s: unknown) => unknown) =>
      selector({ isAuthenticated: true, logout: logoutMock })
    )

    // Mock window.confirm to always return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)

    // Setup QueryClient for testing
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          refetchOnWindowFocus: false,
        },
      },
    })

    // Render with all required providers
    render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </MantineProvider>
      </QueryClientProvider>
    )

    // Open drawer
    const openBtns = screen.getAllByLabelText(/open menu/i)
    fireEvent.click(openBtns[0])

    // Find SIGN OUT button (using the Spanish text from the component)
    const signOut = await screen.findByText(/CERRAR SESION/i)
    fireEvent.click(signOut)

    expect(confirmSpy).toHaveBeenCalled()
    expect(logoutMock).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})
