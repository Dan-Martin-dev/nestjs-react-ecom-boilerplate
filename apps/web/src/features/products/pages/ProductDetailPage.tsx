import { Link, useParams } from '@tanstack/react-router'
import { Button } from '../../../components/ui/button'
import { useAddToCart } from '../../../hooks/useCart'
import { useAuthStore } from '../../../stores/auth'
import { ArrowLeft, Star } from 'lucide-react'

// Mock product data - would come from API based on productId
const mockProduct = {
  id: '1',
  name: 'Wireless Headphones',
  price: 99.99,
  images: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop&crop=center',
    'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=600&h=600&fit=crop&crop=center'
  ],
  description: 'Experience premium sound quality with our state-of-the-art wireless headphones. Featuring active noise cancellation, 30-hour battery life, and crystal-clear audio reproduction.',
  features: [
    'Active Noise Cancellation',
    '30-hour battery life',
    'Bluetooth 5.0 connectivity',
    'Premium build quality',
    'Comfortable over-ear design'
  ],
  rating: 4.8,
  reviews: 127,
  inStock: true
}

export function ProductDetailPage() {
  const { productId } = useParams({ from: '/products/$productId' })
  // TODO: Use productId to fetch actual product data instead of mock data
  console.log('Product ID:', productId) // Temporary to avoid linting error
  const { isAuthenticated } = useAuthStore()
  const addToCartMutation = useAddToCart()

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      return
    }

    try {
      // For demo purposes, we'll use a mock variant ID
      // In a real app, this would come from the product data
      await addToCartMutation.mutateAsync({
        productVariantId: 'mock-variant-id', // This should come from actual product data
        quantity: 1,
      })
      alert('Item added to cart!')
    } catch (error) {
      console.error('Failed to add to cart:', error)
      alert('Failed to add item to cart')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden border">
            <img
              src={mockProduct.images[0]}
              alt={mockProduct.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {mockProduct.images.slice(1).map((image, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden border">
                <img
                  src={image}
                  alt={`${mockProduct.name} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{mockProduct.name}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(mockProduct.rating) 
                        ? 'text-yellow-400 fill-current' 
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {mockProduct.rating} ({mockProduct.reviews} reviews)
              </span>
            </div>
            <div className="text-3xl font-bold text-primary mb-4">
              ${mockProduct.price}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{mockProduct.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Features</h3>
            <ul className="space-y-1">
              {mockProduct.features.map((feature, index) => (
                <li key={index} className="text-muted-foreground flex items-center gap-2">
                  <span className="w-1 h-1 bg-primary rounded-full"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-sm ${
                mockProduct.inStock 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {mockProduct.inStock ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={handleAddToCart}
                disabled={!mockProduct.inStock}
                className="flex-1"
              >
                Add to Cart
              </Button>
              <Button variant="outline">
                Add to Wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
