import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { useProducts } from '../../../hooks/useProducts';
import { useAddToCart } from '../../../hooks/useCart';
import { useAuthStore } from '../../../stores';
import { notifications } from '@mantine/notifications';
import type { Product } from '../../../types/api';

const ProductsPage = () => {
  const [filter, setFilter] = useState<'all' | 'electronics' | 'accessories'>('all')
  const { isAuthenticated } = useAuthStore()
  const { data: productsResponse, isLoading, error } = useProducts({})
  const addToCartMutation = useAddToCart()

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      notifications.show({
        title: 'Authentication Required',
        message: 'Please login to add items to cart',
        color: 'yellow'
      });
      return
    }

    // For demo purposes, use first variant if available
    const firstVariant = product.variants?.[0]
    if (!firstVariant) {
      notifications.show({
        title: 'Product Unavailable',
        message: 'This product has no available variants',
        color: 'red'
      });
      return
    }

    try {
      await addToCartMutation.mutateAsync({
        productVariantId: firstVariant.id,
        quantity: 1,
      })
      notifications.show({
        title: 'Success',
        message: 'Item added to cart!',
        color: 'green'
      });
    } catch (error) {
      console.error('Failed to add to cart:', error)
      notifications.show({
        title: 'Error',
        message: 'Failed to add item to cart',
        color: 'red'
      });
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2"></div>
          <div className="h-4 w-96 bg-muted animate-pulse rounded mb-6"></div>
          <div className="flex gap-2 mb-6">
            <div className="h-10 w-32 bg-muted animate-pulse rounded">asd</div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
            <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg overflow-hidden">
              <div className="w-full h-48 bg-muted animate-pulse"></div>
              <div className="p-4">
                <div className="h-6 w-3/4 bg-muted animate-pulse mb-2"></div>
                <div className="h-4 w-full bg-muted animate-pulse mb-1"></div>
                <div className="h-4 w-2/3 bg-muted animate-pulse mb-3"></div>
                <div className="flex items-center justify-between">
                  <div className="h-8 w-20 bg-muted animate-pulse"></div>
                  <div className="h-10 w-28 bg-muted animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-red-600">Error loading products. Please try again.</div>
        </div>
      </div>
    )
  }

  const products = productsResponse?.data || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Our Products</h1>
        <p className="text-muted-foreground mb-6">
          Discover our amazing collection of products
        </p>
        
        {/* Filter buttons */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Products
          </Button>
          <Button
            variant={filter === 'electronics' ? 'default' : 'outline'}
            onClick={() => setFilter('electronics')}
          >
            Electronics
          </Button>
          <Button
            variant={filter === 'accessories' ? 'default' : 'outline'}
            onClick={() => setFilter('accessories')}
          >
            Accessories
          </Button>
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={product.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${parseFloat(product.price).toFixed(2)}</span>
                  <Button 
                    onClick={() => handleAddToCart(product)}
                    disabled={addToCartMutation.isPending}
                  >
                    {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground text-lg">No products available</p>
          </div>
        )}
      </div>
    </div>
  )
}
export default ProductsPage;
