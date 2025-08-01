import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { useProducts } from '../../../hooks/useProducts';
import { useAddCartItem } from '../../../hooks/useCart';
import { useAuth } from '../../../hooks/useAuthContext';
import type { Product } from '../../../types/api';

// Mock product data - in a real app, this would come from an API
const mockProducts = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 99.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&crop=center',
    description: 'High-quality wireless headphones with noise cancellation.'
  },
  {
    id: '2',
    name: 'Smart Watch',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&crop=center',
    description: 'Feature-rich smartwatch with health monitoring.'
  },
  {
    id: '3',
    name: 'Laptop Stand',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop&crop=center',
    description: 'Ergonomic laptop stand for better posture.'
  },
  {
    id: '4',
    name: 'Coffee Mug',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=400&h=400&fit=crop&crop=center',
    description: 'Premium ceramic coffee mug with thermal insulation.'
  },
  {
    id: '5',
    name: 'Desk Lamp',
    price: 79.99,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop&crop=center',
    description: 'Modern LED desk lamp with adjustable brightness.'
  },
  {
    id: '6',
    name: 'Backpack',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&crop=center',
    description: 'Durable travel backpack with multiple compartments.'
  }
]

export function ProductsPage() {
  const [filter, setFilter] = useState<'all' | 'electronics' | 'accessories'>('all')
  const { addItem } = useCartStore()

  const handleAddToCart = (product: typeof mockProducts[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    })
  }

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
        {mockProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
              <p className="text-muted-foreground text-sm mb-3">
                {product.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">${product.price}</span>
                <Button onClick={() => handleAddToCart(product)}>
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
