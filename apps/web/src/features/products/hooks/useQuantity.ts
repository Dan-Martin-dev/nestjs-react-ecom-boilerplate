import { useState } from 'react';

export const useQuantity = (initialQuantity: number = 1) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity);

  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(1, prev - 1));
  };

  const resetQuantity = () => {
    setQuantity(initialQuantity);
  };

  return {
    quantity,
    increaseQuantity,
    decreaseQuantity,
    resetQuantity,
    setQuantity,
  };
};
