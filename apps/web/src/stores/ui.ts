import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message?: string
  autoClose?: boolean
  duration?: number
}

interface Modal {
  id: string
  component: React.ComponentType<Record<string, unknown>>
  props?: Record<string, unknown>
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  centered?: boolean
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
}

interface UIState {
  // Theme
  colorScheme: 'light' | 'dark' | 'auto'
  
  // Loading states
  globalLoading: boolean
  loadingMessage?: string
  
  // Notifications
  notifications: Notification[]
  
  // Modals
  modals: Modal[]
  
  // Navigation
  sidebarOpen: boolean
  mobileMenuOpen: boolean
  
  // Search
  searchOpen: boolean
  searchQuery: string
  
  // Cart
  cartOpen: boolean
}

interface UIActions {
  // Theme
  setColorScheme: (scheme: 'light' | 'dark' | 'auto') => void
  toggleColorScheme: () => void
  
  // Loading
  setGlobalLoading: (loading: boolean, message?: string) => void
  
  // Notifications
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Modals
  openModal: (modal: Omit<Modal, 'id'>) => string
  closeModal: (id: string) => void
  closeAllModals: () => void
  
  // Navigation
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setMobileMenuOpen: (open: boolean) => void
  toggleMobileMenu: () => void
  
  // Search
  setSearchOpen: (open: boolean) => void
  toggleSearch: () => void
  setSearchQuery: (query: string) => void
  
  // Cart
  setCartOpen: (open: boolean) => void
  toggleCart: () => void
}

type UIStore = UIState & UIActions

const initialState: UIState = {
  colorScheme: 'auto',
  globalLoading: false,
  loadingMessage: undefined,
  notifications: [],
  modals: [],
  sidebarOpen: false,
  mobileMenuOpen: false,
  searchOpen: false,
  searchQuery: '',
  cartOpen: false,
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Theme
      setColorScheme: (scheme) => {
        set({ colorScheme: scheme })
      },

      toggleColorScheme: () => {
        const { colorScheme } = get()
        const newScheme = colorScheme === 'light' ? 'dark' : 'light'
        set({ colorScheme: newScheme })
      },

      // Loading
      setGlobalLoading: (loading, message) => {
        set({ globalLoading: loading, loadingMessage: message })
      },

      // Notifications
      addNotification: (notification) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newNotification: Notification = {
          id,
          autoClose: true,
          duration: 5000,
          ...notification,
        }
        
        set((state) => ({
          notifications: [...state.notifications, newNotification],
        }))

        // Auto-remove notification if autoClose is enabled
        if (newNotification.autoClose) {
          setTimeout(() => {
            get().removeNotification(id)
          }, newNotification.duration)
        }
      },

      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },

      // Modals
      openModal: (modal) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newModal: Modal = {
          id,
          size: 'md',
          centered: true,
          closeOnClickOutside: true,
          closeOnEscape: true,
          ...modal,
        }
        
        set((state) => ({
          modals: [...state.modals, newModal],
        }))
        
        return id
      },

      closeModal: (id) => {
        set((state) => ({
          modals: state.modals.filter((m) => m.id !== id),
        }))
      },

      closeAllModals: () => {
        set({ modals: [] })
      },

      // Navigation
      setSidebarOpen: (open) => {
        set({ sidebarOpen: open })
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }))
      },

      setMobileMenuOpen: (open) => {
        set({ mobileMenuOpen: open })
      },

      toggleMobileMenu: () => {
        set((state) => ({ mobileMenuOpen: !state.mobileMenuOpen }))
      },

      // Search
      setSearchOpen: (open) => {
        set({ searchOpen: open })
      },

      toggleSearch: () => {
        set((state) => ({ searchOpen: !state.searchOpen }))
      },

      setSearchQuery: (query) => {
        set({ searchQuery: query })
      },

      // Cart
      setCartOpen: (open) => {
        set({ cartOpen: open })
      },

      toggleCart: () => {
        set((state) => ({ cartOpen: !state.cartOpen }))
      },
    }),
    {
      name: 'ui-store',
    }
  )
)
