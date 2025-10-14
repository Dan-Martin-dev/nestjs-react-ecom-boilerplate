import React from 'react';
import { Button } from '../../../components/ui/button';
import { ShoppingCart, Heart } from 'lucide-react';

interface AddToCartButtonProps {
  onAddToCart: () => void;
  isLoading: boolean;
  disabled: boolean;
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
  onAddToCart,
  isLoading,
  disabled,
}) => {
  return (
    <div className="flex flex-col space-y-3 mb-10">
      <Button
        onClick={onAddToCart}
        disabled={disabled || isLoading}
        className="bg-[#3b2b1b] hover:bg-[#2a1f13] text-white py-4 w-full rounded-none font-normal text-base flex justify-center"
      >
        <ShoppingCart className="mr-2 h-5 w-5" />
        {isLoading ? 'Adding...' : 'Add to Cart'}
      </Button>

      <Button
        variant="outline"
        className="border-gray-300 text-gray-800 py-4 w-full rounded-none font-normal text-base flex justify-center hover:bg-gray-50"
      >
        <Heart className="mr-2 h-5 w-5" />
        Add to Wishlist
      </Button>
    </div>
  );
};
