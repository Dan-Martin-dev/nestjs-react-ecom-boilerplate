import { useAddToCart } from '../../../hooks/useCart';
import { useAuthStore } from '../../../stores';
import { toast } from 'sonner';

export const useProductCart = () => {
  const { isAuthenticated } = useAuthStore();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = async (selectedVariantId: string | null, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    if (!selectedVariantId) {
      toast.error('Please select a variant');
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        productVariantId: selectedVariantId,
        quantity,
      });
      toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`);
    } catch (err) {
      console.error('Failed to add to cart:', err);
      toast.error('Failed to add item to cart');
    }
  };

  return {
    handleAddToCart,
    isLoading: addToCartMutation.isPending,
  };
};
