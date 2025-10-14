import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  quantity,
  onIncrease,
  onDecrease,
}) => {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-medium mb-3 uppercase">Quantity</h3>
      <div className="flex items-center border border-gray-300 w-36">
        <button
          onClick={onDecrease}
          className="w-10 h-10 flex items-center justify-center border-r border-gray-300"
          aria-label="Decrease quantity"
        >
          <Minus size={16} />
        </button>
        <div className="flex-1 text-center">
          <span className="text-sm">{quantity}</span>
        </div>
        <button
          onClick={onIncrease}
          className="w-10 h-10 flex items-center justify-center border-l border-gray-300"
          aria-label="Increase quantity"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};
