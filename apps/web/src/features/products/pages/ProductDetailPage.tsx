import { Link, useParams } from 'react-router-dom'
import { Button } from '../../../components/ui/button'
import { useAddToCart } from '../../../hooks/useCart'
import { useAuthStore } from '../../../stores'
import { ArrowLeft, ChevronDown, Minus, Plus, ShoppingCart, Heart } from 'lucide-react'
import { useProductBySlug } from '../../../hooks/useProducts'
import { useState, useEffect } from 'react'
import type { Product, ProductImage, ProductVariant } from '@repo/shared'
import '../../auth/styles/auth-fonts.css'

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
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0)
  const [openAccordion, setOpenAccordion] = useState<string | null>('description')
  const [notificationVisible, setNotificationVisible] = useState<boolean>(false)
  const [notificationMessage, setNotificationMessage] = useState<string>('')

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
      setNotificationMessage('Please login to add items to cart')
      setNotificationVisible(true)
      setTimeout(() => setNotificationVisible(false), 3000)
      return
    }

    if (!selectedVariantId) {
      setNotificationMessage('Please select a variant')
      setNotificationVisible(true)
      setTimeout(() => setNotificationVisible(false), 3000)
      return
    }

    try {
      await addToCartMutation.mutateAsync({
        productVariantId: selectedVariantId,
        quantity,
      })
      setNotificationMessage(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`)
      setNotificationVisible(true)
      setTimeout(() => setNotificationVisible(false), 3000)
    } catch (err) {
      console.error('Failed to add to cart:', err)
      setNotificationMessage('Failed to add item to cart')
      setNotificationVisible(true)
      setTimeout(() => setNotificationVisible(false), 3000)
    }
  }

  const toggleAccordion = (section: string) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1)
  }

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded"></div>
          <div className="h-64 w-full max-w-md bg-gray-200 rounded"></div>
          <div className="h-4 w-full max-w-md bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-lg font-medium text-red-800 mb-2">Product Not Found</h2>
          <p className="text-red-700">We couldn't find the product you're looking for.</p>
          <Link 
            to="/products" 
            className="mt-4 inline-flex items-center text-sm font-medium text-red-700 hover:text-red-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Return to Products
          </Link>
        </div>
      </div>
    )
  }

  // Map images
  const images: ProductImage[] = (product?.images as ProductImage[]) ?? []
  const currentImage = images[selectedImageIndex] || images[0]

  // Format price to show cents properly
  const formattedPrice = parseFloat(selectedVariant?.price || product.price).toFixed(2)

  // Extract fabric details or use default
  const fabricDetails = product.description?.includes('GSM') 
    ? product.description 
    : '275 GSM JERSEY'

  return (
    <div className="bg-white auth-font-inco">
      
      {/* Top navigation bar */}
      <div className="border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex py-4 text-sm uppercase tracking-wide">
            <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link to="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-12 lg:grid lg:grid-cols-2 lg:gap-x-12">
        {/* Product Images */}
        <div className="mb-10 lg:mb-0">
          {/* Main Image */}
          <div className="-mx-4 lg:mx-0 -mt-12 lg:mt-0 aspect-square overflow-hidden bg-gray-50 mb-6">
            <img
              src={currentImage?.url ?? ''}
              alt={currentImage?.altText ?? product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image Gallery - Carousel on mobile, grid on desktop */}
          <div className="lg:hidden">
            {/* Mobile Carousel */}
            <div className="relative">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {images.map((img: ProductImage, index: number) => (
                  <button
                    key={img.id || index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 border-2 ${selectedImageIndex === index ? 'border-black' : 'border-gray-200'} hover:border-gray-400 transition`}
                  >
                    <img
                      src={img.url}
                      alt={img.altText ?? `View ${index + 1} of ${product.name}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden lg:grid lg:grid-cols-5 lg:gap-2">
            {images.map((img: ProductImage, index: number) => (
              <button
                key={img.id || index}
                onClick={() => setSelectedImageIndex(index)}
                className={`aspect-square border ${selectedImageIndex === index ? 'border-black' : 'border-gray-200'} hover:border-gray-400 transition`}
              >
                <img
                  src={img.url}
                  alt={img.altText ?? `View ${index + 1} of ${product.name}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div className="lg:pl-10">
          {/* Fabric type */}
          <div className="mb-4">
            <p className="text-sm text-gray-500 tracking-wide uppercase">
              {fabricDetails}
            </p>
          </div>

          {/* Title & Price */}
          <h1 className="text-3xl font-medium mb-6">{product.name.toUpperCase()}</h1>
          <div className="mb-8">
            <p className="text-xl">${formattedPrice}</p>
          </div>

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium mb-3 uppercase">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: ProductVariant) => {
                  // Determine if this variant is a color
                  const isColor = v.name.toLowerCase().includes('black') ||
                                  v.name.toLowerCase().includes('white') ||
                                  v.name.toLowerCase().includes('grey') ||
                                  v.name.toLowerCase().includes('navy');
                  
                  let backgroundColor = '#ddd';
                  if (v.name.toLowerCase().includes('black')) backgroundColor = '#000';
                  if (v.name.toLowerCase().includes('white')) backgroundColor = '#fff';
                  if (v.name.toLowerCase().includes('grey')) backgroundColor = '#aaa';
                  if (v.name.toLowerCase().includes('navy')) backgroundColor = '#003366';
                  
                  return isColor ? (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center focus:outline-none ${
                        selectedVariantId === v.id 
                          ? 'ring-2 ring-offset-2 ring-black' 
                          : 'ring-1 ring-gray-200'
                      }`}
                      title={v.name}
                      aria-label={`Select ${v.name} color`}
                    >
                      <span 
                        className="w-8 h-8 rounded-full" 
                        style={{ backgroundColor }}
                      ></span>
                    </button>
                  ) : (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-4 py-2 border ${
                        selectedVariantId === v.id 
                          ? 'border-black bg-black text-white' 
                          : 'border-gray-300 bg-white hover:border-gray-400'
                      }`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mb-8">
            <h3 className="text-sm font-medium mb-3 uppercase">Quantity</h3>
            <div className="flex items-center border border-gray-300 w-36">
              <button 
                onClick={decreaseQuantity}
                className="w-10 h-10 flex items-center justify-center border-r border-gray-300"
                aria-label="Decrease quantity"
              >
                <Minus size={16} />
              </button>
              <div className="flex-1 text-center">
                <span className="text-sm">{quantity}</span>
              </div>
              <button 
                onClick={increaseQuantity}
                className="w-10 h-10 flex items-center justify-center border-l border-gray-300"
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Add to Cart & Wishlist */}
          <div className="flex flex-col space-y-3 mb-10">
            <Button
              onClick={handleAddToCart}
              disabled={!selectedVariantId || addToCartMutation.isPending}
              className="bg-[#3b2b1b] hover:bg-[#2a1f13] text-white py-4 w-full rounded-none font-normal text-base flex justify-center"
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>
            
            <Button
              variant="outline"
              className="border-gray-300 text-gray-800 py-4 w-full rounded-none font-normal text-base flex justify-center hover:bg-gray-50"
            >
              <Heart className="mr-2 h-5 w-5" />
              Add to Wishlist
            </Button>
          </div>

          {/* Product Information Accordions */}
          <div className="border-t border-gray-200">
            {/* Description Accordion */}
            <div className="border-b border-gray-200">
              <button
                className="flex justify-between items-center w-full py-4 px-2 text-left focus:outline-none"
                onClick={() => toggleAccordion('description')}
                aria-expanded={openAccordion === 'description'}
                aria-controls="description-panel"
              >
                <span className="font-medium uppercase text-sm">Product Description</span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform ${openAccordion === 'description' ? 'transform rotate-180' : ''}`}
                />
              </button>
              <div 
                id="description-panel"
                className={`overflow-hidden transition-all duration-300 ${openAccordion === 'description' ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="px-2 pb-4 text-gray-600">
                  <p>{product.description || 'No detailed description available for this product.'}</p>
                </div>
              </div>
            </div>
            
            {/* Size Guide Accordion */}
            <div className="border-b border-gray-200">
              <button
                className="flex justify-between items-center w-full py-4 px-2 text-left focus:outline-none"
                onClick={() => toggleAccordion('size')}
                aria-expanded={openAccordion === 'size'}
                aria-controls="size-panel"
              >
                <span className="font-medium uppercase text-sm">Size Guide</span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform ${openAccordion === 'size' ? 'transform rotate-180' : ''}`}
                />
              </button>
              <div 
                id="size-panel"
                className={`overflow-hidden transition-all duration-300 ${openAccordion === 'size' ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="px-2 pb-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 pr-4">Size</th>
                          <th className="text-left py-2 px-4">Chest (inches)</th>
                          <th className="text-left py-2 px-4">Length (inches)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 pr-4">S</td>
                          <td className="py-2 px-4">36-38</td>
                          <td className="py-2 px-4">28</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 pr-4">M</td>
                          <td className="py-2 px-4">39-41</td>
                          <td className="py-2 px-4">29</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 pr-4">L</td>
                          <td className="py-2 px-4">42-44</td>
                          <td className="py-2 px-4">30</td>
                        </tr>
                        <tr className="border-b border-gray-100">
                          <td className="py-2 pr-4">XL</td>
                          <td className="py-2 px-4">45-47</td>
                          <td className="py-2 px-4">31</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Shipping Accordion */}
            <div className="border-b border-gray-200">
              <button
                className="flex justify-between items-center w-full py-4 px-2 text-left focus:outline-none"
                onClick={() => toggleAccordion('shipping')}
                aria-expanded={openAccordion === 'shipping'}
                aria-controls="shipping-panel"
              >
                <span className="font-medium uppercase text-sm">Shipping & Returns</span>
                <ChevronDown 
                  className={`w-5 h-5 transition-transform ${openAccordion === 'shipping' ? 'transform rotate-180' : ''}`}
                />
              </button>
              <div 
                id="shipping-panel"
                className={`overflow-hidden transition-all duration-300 ${openAccordion === 'shipping' ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="px-2 pb-4 text-gray-600">
                  <p className="mb-3">Free shipping on all orders over $100.</p>
                  <p className="mb-3">Orders typically ship within 1-2 business days.</p>
                  <p>Returns accepted within 30 days of delivery for unworn items.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Product recommendations section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-medium mb-8 text-center">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {/* This would typically be populated with recommended products */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-white border border-gray-100"></div>
            ))}
          </div>
        </div>
      </section>

      {/* Toast notification */}
      <div 
        className={`fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded shadow-lg transition-opacity duration-300 flex items-center
                  ${notificationVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        role="alert"
      >
        {notificationMessage}
      </div>
    </div>
  )
}

export default ProductDetailPage;
