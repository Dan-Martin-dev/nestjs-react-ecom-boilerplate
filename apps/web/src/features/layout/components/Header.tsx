import { Link } from 'react-router-dom'
import { ShoppingCart, User, Menu, Search } from 'lucide-react'
import { Button } from '@mantine/core'
import { useCart } from '../../../hooks/useCart'
import { useAuthStore } from '../../../stores'
import '../../../styles/MovingBar.css'

export function Header() {
  const { data: cart } = useCart()
  const { isAuthenticated } = useAuthStore()
  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* Moving bar uses styles from MovingBar.css (global import above) */}
      <div className="moving-bar moving-bar-pause-hover" aria-hidden="true">
        <div className="moving-bar-inner">
          <div className="moving-bar-content">
            {[
              'FREE SHIPPING ON ALL ORDERS OVER $50',
              'FREE SHIPPING ON ALL ORDERS OVER $50',
              'FREE SHIPPING ON ALL ORDERS OVER $50',
              'FREE SHIPPING ON ALL ORDERS OVER $50'
            ].map((msg, idx) => (
              <span key={idx}>{msg}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="container mx-auto flex h-16 items-center px-4">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold text-blue-600"></span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/products"
            className="transition-colors hover:text-gray-800 text-gray-600"
          >
            Products
          </Link>
          <Link
            to="/products"
            className="transition-colors hover:text-gray-800 text-gray-600"
          >
            Categories
          </Link>
        </nav>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button variant="outline" className="inline-flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="hidden md:inline-block">Search products...</span>
            </Button>
          </div>
          
          <nav className="flex items-center space-x-2">
            <Link to="/cart">
              <Button variant="outline" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-blue-600 text-xs text-white flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="outline">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
            
            <Button variant="outline" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
