import { Link } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { useCart, useUpdateCartItem, useRemoveFromCart, useClearCart } from '../../../hooks/useCart'
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react'

const CartPage = () => {
  const { data: cart, isLoading, error } = useCart()
  const updateCartItemMutation = useUpdateCartItem()
  const removeFromCartMutation = useRemoveFromCart()
  const clearCartMutation = useClearCart()

  const items = cart?.items || []
  const totalPrice = items.reduce((total, item) => total + (parseFloat(item.priceAtAddition) * item.quantity), 0)
  /* const totalItems = items.reduce((total, item) => total + item.quantity, 0) */

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) return
    try {
      await updateCartItemMutation.mutateAsync({ itemId, quantity })
    } catch (error) {
      console.error('Failed to update cart item:', error)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCartMutation.mutateAsync(itemId)
    } catch (error) {
      console.error('Failed to remove cart item:', error)
    }
  }

  const handleClearCart = async () => {
    try {
      await clearCartMutation.mutateAsync()
    } catch (error) {
      console.error('Failed to clear cart:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading cart...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-2">Error loading cart</h1>
          <p className="text-muted-foreground mb-6">
            There was an error loading your cart. Please try again.
          </p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
              {item.productVariant.product.images && item.productVariant.product.images.length > 0 && (
                <img
                  src={item.productVariant.product.images[0].url}
                  alt={item.productVariant.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
              )}
              
              <div className="flex-1">
                <h3 className="font-semibold">{item.productVariant.product.name}</h3>
                <p className="text-muted-foreground">${parseFloat(item.priceAtAddition).toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1 || updateCartItemMutation.isPending}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center">{item.quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  disabled={updateCartItemMutation.isPending}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-right">
                <p className="font-semibold">${(parseFloat(item.priceAtAddition) * item.quantity).toFixed(2)}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                  disabled={removeFromCartMutation.isPending}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold">Order Summary</h2>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${(totalPrice * 0.1).toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${(totalPrice * 1.1).toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Button className="w-full">Proceed to Checkout</Button>
              <Button variant="outline" onClick={handleClearCart} disabled={clearCartMutation.isPending} className="w-full">
                {clearCartMutation.isPending ? 'Clearing...' : 'Clear Cart'}
              </Button>
            </div>
            
            <Link to="/products" className="block">
              <Button variant="ghost" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default CartPage;
