import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import type { Section } from '../hooks/useDrawerMenu'
import { useCart } from '../../../hooks/useCart'

const DRAWER_Z_INDEX = { backdrop: 99998, panel: 99999 }
const FOCUSABLE_SELECTORS = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export interface CartDrawerProps {
  open: boolean
  onClose: () => void
  sections: Section[]
  accountSection: Section
  isAuthenticated: boolean
  onLogout: () => Promise<void>
  onNavigate: (path: string) => void
  onTrackEvent: (event: string, data?: Record<string, unknown>) => void
}

export function CartDrawer({ open, onClose, onNavigate, onTrackEvent }: CartDrawerProps) {
  // track that portal has mounted at least once (so we can animate from closed)
  const [hasOpened, setHasOpened] = useState(false)
  const [animateOpen, setAnimateOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement | null>(null)
  const previouslyFocused = useRef<Element | null>(null)

  const { data: cart } = useCart()

  useEffect(() => {
    if (open) {
      setHasOpened(true)
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(() => setAnimateOpen(true))
      } else {
        setTimeout(() => setAnimateOpen(true), 16)
      }
    } else {
      setAnimateOpen(false)
    }
  }, [open])

  useEffect(() => {
    if (!animateOpen) {
      document.body.style.overflow = ''
      if (previouslyFocused.current instanceof HTMLElement) previouslyFocused.current.focus()
      return
    }

    previouslyFocused.current = document.activeElement
    document.body.style.overflow = 'hidden'

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
      if (e.key === 'Tab') {
        const container = panelRef.current
        if (!container) return
        const focusable = container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (!e.shiftKey && active === last) {
          e.preventDefault(); first.focus()
        }
        if (e.shiftKey && active === first) {
          e.preventDefault(); last.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKey)
    setTimeout(() => {
      const container = panelRef.current
      const focusable = container?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      if (focusable && focusable.length > 0) {
        const target = focusable.length > 1 ? focusable[1] : focusable[0]
        target.focus()
      }
    }, 0)

    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [animateOpen, onClose])

  const portal = (typeof document !== 'undefined' && (hasOpened || open)) ? createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 motion-reduce:transition-none ${animateOpen ? 'opacity-80 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        style={{ zIndex: DRAWER_Z_INDEX.backdrop }}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-drawer-title"
        className={`fixed top-0 right-0 h-full shadow-lg w-full md:w-[420px] lg:w-[420px] transform transition-transform duration-300 motion-reduce:transition-none ${animateOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ willChange: 'transform', zIndex: DRAWER_Z_INDEX.panel, overflow: 'visible' }}
      >
        <div className="h-full flex flex-col bg-white">

          <div className="flex items-center justify-between px-4 pt-4">
            <h2 id="cart-drawer-title" className="text-xl font-teko">Your Cart</h2>
            <button
              aria-label="Close cart"
              onClick={onClose}
              className="drawer-close-button p-2 rounded bg-transparent hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-900" />
            </button>
          </div>

          <div className="px-4 pt-6 overflow-y-auto flex-1 bg-white" style={{ WebkitOverflowScrolling: 'touch' }}>
            {/* Cart summary: simple list of items */}
            <div className="mt-2">
              <div className="px-2 mt-2 space-y-3">
                {cart?.items && cart.items.length > 0 ? (
                  cart.items.map((it) => {
                    const name = it.productVariant?.product?.name ?? it.productVariant?.name ?? 'Item'
                    const price = Number(it.productVariant?.price ?? it.priceAtAddition ?? 0)
                    return (
                      <div key={it.id} className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium">{name}</div>
                          <div className="text-xs text-gray-500">Qty: {it.quantity}</div>
                        </div>
                        <div className="text-sm">${(price * it.quantity).toFixed(2)}</div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-sm text-gray-500 px-2">Your cart is empty.</div>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 py-4 border-t bg-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-700">Subtotal</div>
                <div className="text-lg font-teko">
                  ${(cart?.items?.reduce((s, it) => {
                    const price = Number(it.productVariant?.price ?? it.priceAtAddition ?? 0)
                    return s + price * it.quantity
                  }, 0) ?? 0).toFixed(2)}
                </div>
              </div>
              <div>
                <button
                  onClick={() => {
                    onTrackEvent?.('cart:checkout_click')
                    onNavigate?.('/checkout')
                    onClose()
                  }}
                  className="bg-black text-white px-4 py-2 rounded"
                >
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>,
    document.body
  ) : null

  return portal
}

export default CartDrawer
