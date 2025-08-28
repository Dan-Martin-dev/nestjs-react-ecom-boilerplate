import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import type { Mock } from 'vitest'
import { Header } from '../components/Header'
import * as authStoreModule from '../../../stores/auth.store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'

// Prevent Mantine and other libs relying on matchMedia from throwing in jsdom
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

// Mock cart hook to avoid network requests during Header render
vi.mock('../../../hooks/useCart', () => ({
  useCart: () => ({ data: { items: [] } }),
}))

// Mock the default export (Zustand selector-style store)
vi.mock('../../../stores/auth.store', () => ({
  default: vi.fn(),
}))

describe('Header auth interactions', () => {
  it('shows SIGN OUT and calls logout when confirmed', async () => {
    const logoutMock = vi.fn().mockResolvedValue(undefined)

    // The mocked default export is a function that receives a selector.
    // Provide a typed mockImplementation that accepts a selector and returns selected props.
    type SelectorInput = { isAuthenticated: boolean; logout: () => Promise<unknown> }
    const mockedStore = (authStoreModule.default as unknown as Mock)

    mockedStore.mockImplementation((selector: (s: SelectorInput) => unknown) =>
      selector({ isAuthenticated: true, logout: logoutMock })
    )

    // mock window.confirm to always return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)

    const qc = new QueryClient()
    render(
      <QueryClientProvider client={qc}>
        <MantineProvider>
          <BrowserRouter>
            <Header />
          </BrowserRouter>
        </MantineProvider>
      </QueryClientProvider>
    )

  // open drawer (header may render multiple 'Open menu' buttons in different
  // places; pick the first one)
  const openBtns = screen.getAllByLabelText(/open menu/i)
  fireEvent.click(openBtns[0])

    // find SIGN OUT button
    const signOut = await screen.findByText(/sign out/i)
    fireEvent.click(signOut)

    expect(confirmSpy).toHaveBeenCalled()
    expect(logoutMock).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})
