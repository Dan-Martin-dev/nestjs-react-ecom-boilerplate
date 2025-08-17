import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
  // Loading states
  isGlobalLoading: boolean
  loadingMessage: string | null
  
  // Modal states
  isLoginModalOpen: boolean
  isRegisterModalOpen: boolean
  isCartDrawerOpen: boolean
  isSearchModalOpen: boolean
  isProductQuickViewOpen: boolean
  selectedProductId: string | null
  
  // Navigation
  isMobileNavOpen: boolean
  
  // Search
  searchQuery: string
  
  // Notifications/Toasts
  notifications: UINotification[]
  
  // Actions
  setGlobalLoading: (loading: boolean, message?: string) => void
  
  // Modal actions
  openLoginModal: () => void
  closeLoginModal: () => void
  openRegisterModal: () => void
  closeRegisterModal: () => void
  openCartDrawer: () => void
  closeCartDrawer: () => void
  toggleCartDrawer: () => void
  openSearchModal: () => void
  closeSearchModal: () => void
  openProductQuickView: (productId: string) => void
  closeProductQuickView: () => void
  
  // Navigation actions
  openMobileNav: () => void
  closeMobileNav: () => void
  toggleMobileNav: () => void
  
  // Search actions
  setSearchQuery: (query: string) => void
  clearSearch: () => void
  
  // Notification actions
  addNotification: (notification: Omit<UINotification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

interface UINotification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number // in milliseconds
  timestamp: Date
}

export const useUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial state
      isGlobalLoading: false,
      loadingMessage: null,
      
      // Modal states
      isLoginModalOpen: false,
      isRegisterModalOpen: false,
      isCartDrawerOpen: false,
      isSearchModalOpen: false,
      isProductQuickViewOpen: false,
      selectedProductId: null,
      
      // Navigation
      isMobileNavOpen: false,
      
      // Search
      searchQuery: '',
      
      // Notifications
      notifications: [],

      // Loading actions
      setGlobalLoading: (isGlobalLoading: boolean, loadingMessage?: string) => {
        set({ 
          isGlobalLoading, 
          loadingMessage: loadingMessage || null 
        })
      },

      // Modal actions
      openLoginModal: () => {
        set({ 
          isLoginModalOpen: true,
          isRegisterModalOpen: false, // Close register if open
        })
      },

      closeLoginModal: () => {
        set({ isLoginModalOpen: false })
      },

      openRegisterModal: () => {
        set({ 
          isRegisterModalOpen: true,
          isLoginModalOpen: false, // Close login if open
        })
      },

      closeRegisterModal: () => {
        set({ isRegisterModalOpen: false })
      },

      openCartDrawer: () => {
        set({ isCartDrawerOpen: true })
      },

      closeCartDrawer: () => {
        set({ isCartDrawerOpen: false })
      },

      toggleCartDrawer: () => {
        set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen }))
      },

      openSearchModal: () => {
        set({ isSearchModalOpen: true })
      },

      closeSearchModal: () => {
        set({ 
          isSearchModalOpen: false,
          searchQuery: '', // Clear search when closing
        })
      },

      openProductQuickView: (productId: string) => {
        set({ 
          isProductQuickViewOpen: true,
          selectedProductId: productId,
        })
      },

      closeProductQuickView: () => {
        set({ 
          isProductQuickViewOpen: false,
          selectedProductId: null,
        })
      },

      // Navigation actions
      openMobileNav: () => {
        set({ isMobileNavOpen: true })
      },

      closeMobileNav: () => {
        set({ isMobileNavOpen: false })
      },

      toggleMobileNav: () => {
        set((state) => ({ isMobileNavOpen: !state.isMobileNavOpen }))
      },

      // Search actions
      setSearchQuery: (searchQuery: string) => {
        set({ searchQuery })
      },

      clearSearch: () => {
        set({ searchQuery: '' })
      },

      // Notification actions
      addNotification: (notification: Omit<UINotification, 'id' | 'timestamp'>) => {
        const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        const newNotification: UINotification = {
          ...notification,
          id,
          timestamp: new Date(),
        }

        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))

        // Auto-remove notification after duration
        const duration = notification.duration || 5000
        setTimeout(() => {
          get().removeNotification(id)
        }, duration)
      },

      removeNotification: (id: string) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }))
      },

      clearNotifications: () => {
        set({ notifications: [] })
      },
    }),
    {
      name: 'ui-store',
    }
  )
)

// Helper hooks for specific UI states
export const useModal = () => {
  const {
    isLoginModalOpen,
    isRegisterModalOpen,
    isCartDrawerOpen,
    isSearchModalOpen,
    isProductQuickViewOpen,
    selectedProductId,
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
    openCartDrawer,
    closeCartDrawer,
    toggleCartDrawer,
    openSearchModal,
    closeSearchModal,
    openProductQuickView,
    closeProductQuickView,
  } = useUIStore()

  return {
    // States
    isLoginModalOpen,
    isRegisterModalOpen,
    isCartDrawerOpen,
    isSearchModalOpen,
    isProductQuickViewOpen,
    selectedProductId,
    
    // Actions
    openLoginModal,
    closeLoginModal,
    openRegisterModal,
    closeRegisterModal,
    openCartDrawer,
    closeCartDrawer,
    toggleCartDrawer,
    openSearchModal,
    closeSearchModal,
    openProductQuickView,
    closeProductQuickView,
  }
}

export const useNavigation = () => {
  const {
    isMobileNavOpen,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
  } = useUIStore()

  return {
    isMobileNavOpen,
    openMobileNav,
    closeMobileNav,
    toggleMobileNav,
  }
}

export const useSearch = () => {
  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
  } = useUIStore()

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
  }
}

export const useNotifications = () => {
  const {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  } = useUIStore()

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  }
}

export default useUIStore
