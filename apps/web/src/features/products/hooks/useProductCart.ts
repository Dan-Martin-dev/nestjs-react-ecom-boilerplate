import { useAddToCart } from '../../../hooks/useCart';
import { useAuthStore } from '../../../stores';
import { toast } from 'sonner';

export const useProductCart = () => {
  const { isAuthenticated } = useAuthStore();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async (selectedVariantId: string | null, quantity: number) => {
    // Check if user is authenticated and log auth status
    console.log('Auth status:', { isAuthenticated });
    
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!selectedVariantId) {
      toast.error('Please select a variant');
      return;
    }

    try {
      // Ensure data is properly formatted as an object with the correct types
      const cartData = {
        productVariantId: selectedVariantId,
        quantity: Number(quantity), // Ensure quantity is a number
      };
      
      console.log('Adding to cart:', cartData); // Debug log
      
      const result = await addToCartMutation.mutateAsync(cartData);
      console.log('Add to cart success:', result);
      toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      // Log more detailed error information
      if (err && typeof err === 'object' && 'message' in err) {
        console.error('Error details:', err.message);
      }
      toast.error('Failed to add item to cart');
    }
  };

  return {
    handleAddToCart,
    isLoading: addToCartMutation.isPending,
  };
};
