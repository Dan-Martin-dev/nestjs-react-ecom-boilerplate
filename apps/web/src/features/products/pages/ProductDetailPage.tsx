import { Link, useParams } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { useAddToCart } from '../../../hooks/useCart'
import { useAuthStore } from '../../../stores'
import { ArrowLeft } from 'lucide-react'
import { useProductBySlug } from '../../../hooks/useProducts'
import { useState, useEffect } from 'react'
import type { Product, ProductImage, ProductVariant } from '@repo/shared'

function ProductDetailPage() {
  const { productId } = useParams()
  const { data: productResp, isLoading, error } = useProductBySlug(productId || '')
  const product = productResp as Product | undefined

  const { isAuthenticated } = useAuthStore()
  const addToCartMutation = useAddToCart()

  // Local UI state
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState<number>(1)

  useEffect(() => {
    if (!selectedVariantId && product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id)
    }
  }, [product, selectedVariantId])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Please login to add items to cart')
      return
    }

    if (!selectedVariantId) {
      alert('Please select a variant')
      return
    }

    try {
      await addToCartMutation.mutateAsync({
        productVariantId: selectedVariantId,
        quantity,
      })
      alert('Item added to cart!')
    } catch (err) {
      console.error('Failed to add to cart:', err)
      alert('Failed to add item to cart')
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center">Loading product...</div>
  }

  if (error || !product) {
    return <div className="p-8 text-center text-red-600">Unable to load product.</div>
  }

  // Map images
  const images: ProductImage[] = (product?.images as ProductImage[]) ?? []

  const mainImage = images.find((i) => i.isDefault) ?? images[0]

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
              src={mainImage?.url ?? ''}
              alt={mainImage?.altText ?? product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {images.slice(0, 6).map((img: ProductImage, index: number) => (
              <div key={img.id ?? index} className="aspect-square rounded-lg overflow-hidden border">
                <img
                  src={img.url}
                  alt={img.altText ?? product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            <div className="text-3xl font-bold text-primary mb-4">
              ${product.price}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Variant</h3>
              <div className="flex gap-2 flex-wrap">
                {product.variants.map((v: ProductVariant) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-3 py-2 border rounded text-sm ${selectedVariantId === v.id ? 'bg-gray-900 text-white' : 'bg-white'}`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <label className="mr-2 text-sm">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 border rounded px-2 py-1"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleAddToCart}
                disabled={!selectedVariantId}
                className="flex-1"
              >
                Add to Cart
              </Button>
              <Button variant="outline">Add to Wishlist</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage;
