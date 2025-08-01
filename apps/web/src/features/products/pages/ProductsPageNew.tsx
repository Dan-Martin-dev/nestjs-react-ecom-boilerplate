import { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/Card';
import { useToast } from '../../../hooks/useToast';
import { useProducts } from '../../../hooks/useProducts';
import { useCategories } from '../../../hooks/useCategories';
import { useAddToCart } from '../../../hooks/useCart';
import type { ProductFilterDto } from '../../../types/api';

export default function ProductsPage() {
  const { toast } = useToast();
  const addToCartMutation = useAddToCart();

  const [filters, setFilters] = useState<ProductFilterDto>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { 
    data: productsData, 
    isLoading: productsLoading, 
    error: productsError 
  } = useProducts(filters);
  
  const { 
    data: categories, 
    isLoading: categoriesLoading 
  } = useCategories();

  const handleFilterChange = (newFilters: Partial<ProductFilterDto>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset page when filters change
    }));
  };

  const handleAddToCart = async (productVariantId: string) => {
    try {
      await addToCartMutation.mutateAsync({
        productVariantId,
        quantity: 1,
      });
      toast({
        title: 'Success',
        description: 'Product added to cart!',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add to cart',
        variant: 'destructive',
      });
    }
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  if (productsError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
          <p className="text-gray-600">
            {productsError instanceof Error ? productsError.message : 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-1/4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            
            {/* Categories Filter */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Categories</h4>
              {categoriesLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => handleFilterChange({ categoryId: undefined })}
                    className={`block w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100 ${
                      !filters.categoryId ? 'bg-blue-100 text-blue-700' : ''
                    }`}
                  >
                    All Categories
                  </button>
                  {categories?.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleFilterChange({ categoryId: category.id })}
                      className={`block w-full text-left text-sm px-2 py-1 rounded hover:bg-gray-100 ${
                        filters.categoryId === category.id ? 'bg-blue-100 text-blue-700' : ''
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">Price Range</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice || ''}
                  onChange={(e) => handleFilterChange({ 
                    minPrice: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handleFilterChange({ 
                    maxPrice: e.target.value ? Number(e.target.value) : undefined 
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                />
              </div>
            </div>

            {/* In Stock Filter */}
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => handleFilterChange({ inStock: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm">In Stock Only</span>
              </label>
            </div>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:w-3/4">
          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [string, 'asc' | 'desc'];
                  handleFilterChange({ sortBy: sortBy as any, sortOrder });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="price-asc">Price Low to High</option>
                <option value="price-desc">Price High to Low</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-4 animate-pulse">
                  <div className="bg-gray-300 h-48 rounded mb-4"></div>
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsData?.data.map((product) => (
                  <Card key={product.id} className="p-4">
                    {/* Product Image */}
                    <div className="mb-4">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0].url}
                          alt={product.images[0].altText || product.name}
                          className="w-full h-48 object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-gray-500">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.name}</h3>
                    {product.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                    )}
                    
                    {/* Categories */}
                    {product.categories.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {product.categories.map((category) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 bg-gray-100 text-xs rounded"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Price and Actions */}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-bold text-green-600">
                        ${Number(product.price).toFixed(2)}
                      </span>
                      {product.variants.length > 0 && (
                        <Button
                          size="sm"
                          onClick={() => handleAddToCart(product.variants[0].id)}
                          disabled={addToCartMutation.isPending}
                        >
                          {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                        </Button>
                      )}
                    </div>

                    {/* Stock Status */}
                    {product.variants.length > 0 && (
                      <div className="mt-2">
                        {product.variants[0].stockQuantity > 0 ? (
                          <span className="text-sm text-green-600">
                            {product.variants[0].stockQuantity} in stock
                          </span>
                        ) : (
                          <span className="text-sm text-red-600">Out of stock</span>
                        )}
                      </div>
                    )}
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {productsData && productsData.meta.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(filters.page! - 1)}
                    disabled={filters.page === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {filters.page} of {productsData.meta.totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(filters.page! + 1)}
                    disabled={filters.page === productsData.meta.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
