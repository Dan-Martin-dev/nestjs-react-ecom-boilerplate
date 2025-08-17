import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { useProducts } from '../../../hooks/useProducts';
import { useAddToCart } from '../../../hooks/useCart';
import { useAuthStore } from '../../../stores';
import type { Product, ProductImage } from '../../../types/api';

export function ProductsPage() {
  const [filter, setFilter] = useState<'all' | 'electronics' | 'accessories'>('all');
  const { isAuthenticated } = useAuthStore();
  const { data: productsResponse, isLoading, error } = useProducts({});
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      alert('Please login to add items to cart');
      return;
    }

    // For now, use the first variant of the product
    const firstVariant = product.variants?.[0];
    if (!firstVariant) {
      alert('This product has no available variants');
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productVariantId: firstVariant.id,
        quantity: 1,
      });
      // Success feedback could go here
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add item to cart');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-lg text-red-600">Error loading products. Please try again.</div>
        </div>
      </div>
    );
  }

  const products = productsResponse?.data || [];

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
                src={(product.images as ProductImage[])?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image'}
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
  );
}

export default ProductsPage;
