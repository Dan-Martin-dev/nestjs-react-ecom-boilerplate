import { Link } from '@tanstack/react-router'
import { ShoppingCart, User, Menu, Search } from 'lucide-react'
import { Button } from '../../../components/ui/button'
import { useCartStore, type CartItem } from '../../cart/stores/cartStore'
import { useAuthStore } from '../../auth/stores/authStore'

export function Header() {
  const { items } = useCartStore()
  const { isAuthenticated } = useAuthStore()
  const itemCount = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="text-xl font-bold">EcomStore</span>
          </Link>
        </div>
        
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link
            to="/products"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Products
          </Link>
          <Link
            to="/products"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
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
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart className="h-4 w-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link to="/auth/login">
                <Button variant="outline">Sign In</Button>
              </Link>
            )}
            
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
