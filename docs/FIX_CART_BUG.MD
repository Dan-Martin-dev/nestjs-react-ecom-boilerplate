# Cart Addition Diagnosis

Let me diagnose why you're getting "Failed to add item to cart" on the heavyweight-tee product page. I'll check the cart functionality implementation.

## Step 1: Check Current Cart Implementation

Let me examine how the cart functionality is currently implemented in your ProductDetailPage:

```tsx
// Check the ProductDetailPage implementation
cat apps/web/src/features/products/pages/ProductDetailPage.tsx
```

```tsx
// Check the useProductCart hook
cat apps/web/src/features/products/hooks/useProductCart.ts
```

## Step 2: Check API Client and Authentication

Let me verify the API client is properly configured:

```tsx
// Check API client setup
cat apps/web/src/lib/api.ts
```

## Step 3: Test Cart API Endpoint

Let me test if the cart API endpoint is working:

```bash
# Test cart endpoint with authentication
curl -X POST http://localhost:3001/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productVariantId": "test-variant-id", "quantity": 1}' \
  -v
```

## Step 4: Check Browser Console

Please check your browser's developer console (F12) when trying to add to cart and look for:

1. **Network tab**: Check the request to `/api/v1/cart/items`
2. **Console tab**: Look for any JavaScript errors
3. **Auth state**: Check if your JWT token is present

## Step 5: Common Issues & Fixes

Based on the error pattern, here are the most likely causes:

### Issue 1: Authentication Token Missing
**Symptoms**: 401 Unauthorized errors
**Fix**: Ensure your JWT token is properly stored and sent

### Issue 2: Variant Selection Not Working
**Symptoms**: Cart addition fails silently or with "variant not found"
**Fix**: Ensure a product variant is selected before adding to cart

### Issue 3: API Request Format Issues
**Symptoms**: "Expected object, received string" errors
**Fix**: Verify the data being sent matches the API schema

### Issue 4: Cart Hook Implementation
**Symptoms**: Hook not properly calling the API
**Fix**: Check the useProductCart hook implementation

Let me check your current implementation and provide fixes:

```tsx
// Check current ProductDetailPage implementation
const ProductDetailPage: React.FC = () => {
  const { productId } = useParams();
  const { data: product, isLoading } = useProduct(productId!);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const { handleAddToCart, isLoading: isAddingToCart } = useProductCart();

  // ... rest of component
};
```

## Step 6: Fix Implementation

Based on my analysis, here are the fixes needed:

```tsx
// Fix 1: Update useProductCart hook to handle authentication properly
export const useProductCart = () => {
  const { isAuthenticated, token } = useAuthStore();
  const queryClient = useQueryClient();
  
  const addToCartMutation = useMutation({
    mutationFn: async (data: { variantId: string; quantity: number }) => {
      if (!isAuthenticated) {
        throw new Error('Please login to add items to cart');
      }

      console.log('🛒 Adding to cart:', data);
      
      const response = await apiClient.post('/cart/items', {
        productVariantId: data.variantId,
        quantity: data.quantity,
      });
      
      console.log('✅ Cart response:', response);
      return response;
    },
    onSuccess: () => {
      toast.success('Item added to cart!');
      // Invalidate cart queries
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      console.error('❌ Cart error:', error);
      const message = error?.response?.data?.message || error?.message || 'Failed to add item to cart';
      toast.error(message);
    },
  });

  const handleAddToCart = (variantId: string | null, quantity: number = 1) => {
    if (!variantId) {
      toast.error('Please select a variant first');
      return;
    }
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    console.log('🚀 Calling addToCart with:', { variantId, quantity });
    addToCartMutation.mutate({ variantId, quantity });
  };

  return {
    handleAddToCart,
    isLoading: addToCartMutation.isPending,
  };
};
```

```tsx
// Fix 2: Update ProductDetailPage to properly handle variant selection
const ProductDetailPage: React.FC = () => {
  const { productId } = useParams();
  const { data: product, isLoading } = useProduct(productId!);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const { handleAddToCart, isLoading: isAddingToCart } = useProductCart();
  const { isAuthenticated } = useAuthStore();

  // Set default variant if available
  useEffect(() => {
    if (product?.variants && !selectedVariantId) {
      const defaultVariant = product.variants.find(v => v.isDefault) || product.variants[0];
      if (defaultVariant) {
        setSelectedVariantId(defaultVariant.id);
      }
    }
  }, [product, selectedVariantId]);

  const handleAddToCartClick = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!selectedVariantId) {
      toast.error('Please select a size and color');
      return;
    }

    handleAddToCart(selectedVariantId, 1);
  };

  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          <ProductImageGallery images={product.images} />
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.description}</p>
          <p className="text-2xl font-bold mb-6">${product.price}</p>

          {/* Variant Selector */}
          <VariantSelector
            variants={product.variants}
            selectedVariantId={selectedVariantId}
            onVariantSelect={setSelectedVariantId}
          />

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCartClick}
            disabled={isAddingToCart || !selectedVariantId}
            className="w-full bg-black text-white py-3 px-6 rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isAddingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

## Step 7: Test the Fixes

Now let's test the cart functionality:

```bash
# 1. Check if you're logged in
curl -s http://localhost:3000/api/auth/me | head -20

# 2. Get a product variant ID
curl -s http://localhost:3001/api/v1/products/heavyweight-tee | jq '.variants[0].id'

# 3. Test cart addition
curl -X POST http://localhost:3001/api/v1/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"productVariantId": "variant-id-here", "quantity": 1}'
```

## Step 8: Debug Information

Please run these steps and share the results:

1. **Check browser console** when clicking "Add to Cart"
2. **Check network tab** for the API request
3. **Check if you're logged in** - the cart requires authentication
4. **Verify variant selection** - make sure a variant is selected

The most likely issues are:
- **Authentication missing** - Cart requires login
- **Variant not selected** - Need to select both color and size
- **API endpoint issues** - Cart API might not be working

Can you share what you see in the browser console when trying to add to cart? This will help me pinpoint the exact issue.