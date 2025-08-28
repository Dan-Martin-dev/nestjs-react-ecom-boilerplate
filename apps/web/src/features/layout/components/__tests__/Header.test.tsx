import { render, screen, fireEvent } from '@testing-library/react'
import { vi } from 'vitest'
import { Header } from '../Header'
import * as authStoreModule from '../../../../stores/auth.store'

vi.mock('../../../../stores/auth.store', () => ({
  default: vi.fn(),
}))

describe('Header auth interactions', () => {
  it('shows SIGN OUT and calls logout when confirmed', async () => {
    const logoutMock = vi.fn().mockResolvedValue(undefined)
  // mock store to return isAuthenticated true
  // mock selector-style zustand store: the selector will be called with a state-like object
  ;(authStoreModule.default as any).mockImplementation((selector: any) => selector({ isAuthenticated: true, logout: logoutMock }))

    // mock window.confirm to always return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true)

    render(<Header />)

    // open drawer
    const openBtn = screen.getByLabelText(/open menu/i)
    fireEvent.click(openBtn)

    // find SIGN OUT button
    const signOut = await screen.findByText(/sign out/i)
    fireEvent.click(signOut)

    expect(confirmSpy).toHaveBeenCalled()
    expect(logoutMock).toHaveBeenCalled()

    confirmSpy.mockRestore()
  })
})
