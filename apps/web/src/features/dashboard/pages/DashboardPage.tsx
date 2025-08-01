import { useAuthStore } from '../../auth/stores/authStore'
import { useCartStore } from '../../cart/stores/cartStore'
import { Button } from '../../../components/ui/button'
import { User, Package, ShoppingCart, LogOut } from 'lucide-react'

export function DashboardPage() {
  const { user, logout } = useAuthStore()
  const { items, getTotalPrice } = useCartStore()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You need to be logged in to view this page.</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    // In real app, you'd redirect to home page
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.name}!</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User Info Card */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold">Profile</h2>
          </div>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
          <Button variant="outline" className="w-full mt-4">
            Edit Profile
          </Button>
        </div>

        {/* Cart Summary Card */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold">Cart</h2>
          </div>
          <div className="space-y-2">
            <p><strong>Items:</strong> {items.length}</p>
            <p><strong>Total:</strong> ${getTotalPrice().toFixed(2)}</p>
          </div>
          <Button variant="outline" className="w-full mt-4">
            View Cart
          </Button>
        </div>

        {/* Orders Card */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="h-8 w-8 text-primary" />
            <h2 className="text-xl font-semibold">Orders</h2>
          </div>
          <div className="space-y-2">
            <p><strong>Total Orders:</strong> 5</p>
            <p><strong>Last Order:</strong> Dec 15, 2024</p>
          </div>
          <Button variant="outline" className="w-full mt-4">
            View Orders
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b">
            <span>Order #12345 shipped</span>
            <span className="text-sm text-muted-foreground">2 days ago</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b">
            <span>Account created</span>
            <span className="text-sm text-muted-foreground">1 week ago</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span>Welcome email sent</span>
            <span className="text-sm text-muted-foreground">1 week ago</span>
          </div>
        </div>
      </div>
    </div>
  )
}
