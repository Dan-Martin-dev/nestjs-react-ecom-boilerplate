import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { devtools } from 'zustand/middleware'
import type { Cart, CartItem } from '@repo/shared'
import { apiClient } from '../lib/api'

interface CartState {
  // State
  cart: Cart | null
  isLoading: boolean
  
  // Actions
  fetchCart: () => Promise<void>
  addToCart: (productVariantId: string, quantity: number) => Promise<void>
  updateCartItem: (itemId: string, quantity: number) => Promise<void>
  removeFromCart: (itemId: string) => Promise<void>
  clearCart: () => Promise<void>
  applyCoupon: (code: string) => Promise<void>
  removeCoupon: () => Promise<void>
  
  // Local actions
  setCart: (cart: Cart | null) => void
  setLoading: (loading: boolean) => void
  
  // Computed
  getItemCount: () => number
  getTotalPrice: () => number
  getItemById: (itemId: string) => CartItem | undefined
  getItemByProductVariant: (productVariantId: string) => CartItem | undefined
}

export const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        cart: null,
        isLoading: false,

        // Fetch current cart
        fetchCart: async () => {
          try {
            set({ isLoading: true })
            
            const cart = await apiClient.get<Cart>('/cart')
            
            set({ 
              cart,
              isLoading: false,
            })
            
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        // Add item to cart
        addToCart: async (productVariantId: string, quantity: number) => {
          try {
            set({ isLoading: true })
            
            // Optimistic update
            const currentCart = get().cart
            if (currentCart) {
              const existingItem = currentCart.items?.find(
                item => item.productVariantId === productVariantId
              )
              
              if (existingItem) {
                // Update existing item quantity
                const updatedItems = currentCart.items?.map(item =>
                  item.productVariantId === productVariantId
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
                ) || []
                
                set({
                  cart: {
                    ...currentCart,
                    items: updatedItems,
                  }
                })
              } else {
                // Add new item (temporary, will be replaced by server response)
                        // Create a lightweight temporary item compatible with CartItem shape
                const createTempItem = (pvId: string, cartId?: string) => {
                          return {
                            id: `temp-${Date.now()}`,
                            productVariantId: pvId,
                            quantity,
                            priceAtAddition: '0',
                  cartId: cartId ?? `temp-cart-${Date.now()}`,
                            productVariant: {
                              id: '',
                              name: '',
                              sku: '',
                              price: '0',
                              stockQuantity: 0,
                              product: {
                                id: '',
                                name: '',
                                slug: '',
                                images: [],
                              },
                            },
                          } as unknown as CartItem
                        }

                        const tempItem = createTempItem(productVariantId, currentCart.id)

                        set({
                          cart: {
                            ...currentCart,
                            items: [...(currentCart.items || []), tempItem],
                          }
                        })
              }
            }
            
            const updatedCart = await apiClient.post<Cart>('/cart/items', {
              productVariantId,
              quantity,
            })
            
            set({ 
              cart: updatedCart,
              isLoading: false,
            })
            
          } catch (error) {
            // Revert optimistic update by refetching
            await get().fetchCart()
            set({ isLoading: false })
            throw error
          }
        },

        // Update cart item quantity
        updateCartItem: async (itemId: string, quantity: number) => {
          try {
            set({ isLoading: true })
            
            // Optimistic update
            const currentCart = get().cart
            if (currentCart) {
              const updatedItems = currentCart.items?.map(item =>
                item.id === itemId
                  ? { ...item, quantity }
                  : item
              ) || []
              
              set({
                cart: {
                  ...currentCart,
                  items: updatedItems,
                }
              })
            }
            
            const updatedCart = await apiClient.put<Cart>(`/cart/items/${itemId}`, {
              quantity,
            })
            
            set({ 
              cart: updatedCart,
              isLoading: false,
            })
            
          } catch (error) {
            // Revert optimistic update
            await get().fetchCart()
            set({ isLoading: false })
            throw error
          }
        },

        // Remove item from cart
        removeFromCart: async (itemId: string) => {
          try {
            set({ isLoading: true })
            
            // Optimistic update
            const currentCart = get().cart
            if (currentCart) {
              const updatedItems = currentCart.items?.filter(item => item.id !== itemId) || []
              
              set({
                cart: {
                  ...currentCart,
                  items: updatedItems,
                }
              })
            }
            
            const updatedCart = await apiClient.delete<Cart>(`/cart/items/${itemId}`)
            
            set({ 
              cart: updatedCart,
              isLoading: false,
            })
            
          } catch (error) {
            // Revert optimistic update
            await get().fetchCart()
            set({ isLoading: false })
            throw error
          }
        },

        // Clear entire cart
        clearCart: async () => {
          try {
            set({ isLoading: true })
            
            await apiClient.delete('/cart')
            
            set({ 
              cart: null,
              isLoading: false,
            })
            
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        // Apply coupon code
        applyCoupon: async (code: string) => {
          try {
            set({ isLoading: true })
            
            const updatedCart = await apiClient.post<Cart>('/cart/coupon', {
              code,
            })
            
            set({ 
              cart: updatedCart,
              isLoading: false,
            })
            
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        // Remove coupon
        removeCoupon: async () => {
          try {
            set({ isLoading: true })
            
            const updatedCart = await apiClient.delete<Cart>('/cart/coupon')
            
            set({ 
              cart: updatedCart,
              isLoading: false,
            })
            
          } catch (error) {
            set({ isLoading: false })
            throw error
          }
        },

        // Set cart (for manual updates)
        setCart: (cart: Cart | null) => {
          set({ cart })
        },

        // Set loading state
        setLoading: (isLoading: boolean) => {
          set({ isLoading })
        },

        // Get total item count
        getItemCount: () => {
          const { cart } = get()
          if (!cart?.items) return 0
          
          return cart.items.reduce((total, item) => total + item.quantity, 0)
        },

        // Get total price
        getTotalPrice: () => {
          const { cart } = get()
          if (!cart?.items) return 0
          
          return cart.items.reduce((total, item) => {
            const price = Number(item.priceAtAddition)
            return total + (price * item.quantity)
          }, 0)
        },

        // Get cart item by ID
        getItemById: (itemId: string) => {
          const { cart } = get()
          return cart?.items?.find(item => item.id === itemId)
        },

        // Get cart item by product variant
        getItemByProductVariant: (productVariantId: string) => {
          const { cart } = get()
          return cart?.items?.find(item => item.productVariantId === productVariantId)
        },
      }),
      {
        name: 'cart-storage',
        storage: createJSONStorage(() => localStorage),
        // Persist entire cart state
        partialize: (state) => ({
          cart: state.cart,
        }),
      }
    ),
    {
      name: 'cart-store',
    }
  )
)

export default useCartStore
