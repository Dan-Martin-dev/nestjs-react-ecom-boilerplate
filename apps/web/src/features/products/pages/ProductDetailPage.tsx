import { useParams } from 'react-router-dom'
import { useAddToCart } from '../../../hooks/useCart'
import { useAuthStore } from '../../../stores'
import { useProductBySlug } from '../../../hooks/useProducts'
import { useState, useEffect } from 'react'
import type { Product, ProductImage, ProductVariant } from '@repo/shared'
import { toast } from 'sonner'
import '../../auth/styles/auth-fonts.css'
import {
  ProductImageCarousel,
  Breadcrumb,
  ProductInfo,
  VariantSelector,
  QuantitySelector,
  AddToCartButton,
  ProductAccordion,
  ProductRecommendations,
  LoadingSkeleton,
  ErrorState,
} from '../components'

function ProductDetailPage() {
  const { productId } = useParams()
  const { data: productResp, isLoading, error } = useProductBySlug(productId || '')
  const product = productResp as Product | undefined

  const { isAuthenticated } = useAuthStore()
  const addToCartMutation = useAddToCart()

  // Local UI state
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState<number>(1)

  // Find selected variant
  useEffect(() => {
    if (product?.variants && selectedVariantId) {
      const variant = product.variants.find(v => v.id === selectedVariantId)
      setSelectedVariant(variant || null)
    }
  }, [selectedVariantId, product])

  // Set default variant
  useEffect(() => {
    if (!selectedVariantId && product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id)
    }
  }, [product, selectedVariantId])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return
    }

    if (!selectedVariantId) {
      toast.error('Please select a variant')
      return
    }

    try {
      await addToCartMutation.mutateAsync({
        productVariantId: selectedVariantId,
        quantity,
      })
      toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`)
    } catch (err) {
      console.error('Failed to add to cart:', err)
      toast.error('Failed to add item to cart')
    }
  }

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !product) {
    return <ErrorState />;
  }

  // Map images
  const images: ProductImage[] = (product?.images as ProductImage[]) ?? []

  return (
    <div className="bg-white auth-font-inco">
      <Breadcrumb productName={product.name} />

      <main className="max-w-6xl mx-auto px-4 py-12 lg:grid lg:grid-cols-2 lg:gap-x-12">
        {/* Product Images */}
        <div className="mb-4 lg:mb-0">
          <ProductImageCarousel images={images} productName={product.name} />
        </div>

        {/* Product Details */}
        <div className=" lg:pl-10 ">
          <ProductInfo product={product} selectedVariant={selectedVariant} />

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariantId}
              onVariantSelect={setSelectedVariantId}
            />
          )}

          <QuantitySelector
            quantity={quantity}
            onIncrease={increaseQuantity}
            onDecrease={decreaseQuantity}
          />

          <AddToCartButton
            onAddToCart={handleAddToCart}
            isLoading={addToCartMutation.isPending}
            disabled={!selectedVariantId}
          />

          <ProductAccordion description={product.description || null} />
        </div>
      </main>

      <ProductRecommendations />
    </div>
  )
}

export default ProductDetailPage;
