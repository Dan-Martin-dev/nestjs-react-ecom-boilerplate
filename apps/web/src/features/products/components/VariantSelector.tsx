import React, { useMemo } from 'react';
import type { ProductVariant } from '@repo/shared';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId: string | null;
  onVariantSelect: (variantId: string) => void;
}

export const VariantSelector: React.FC<VariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onVariantSelect,
}) => {
  // Extract unique attribute values
  const { uniqueColors, uniqueSizes } = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();
    
    variants.forEach(variant => {
      variant.ProductVariantAttribute?.forEach(attr => {
        if (attr.attribute.type === 'COLOR') {
          colors.add(attr.value);
        } else if (attr.attribute.type === 'SIZE') {
          sizes.add(attr.value);
        }
      });
    });
    
    return {
      uniqueColors: Array.from(colors),
      uniqueSizes: Array.from(sizes)
    };
  }, [variants]);

  const getColorBackground = (color: string) => {
    const colorMap: Record<string, string> = {
      'White': '#ffffff',
      'Black': '#000000',
      'Blue': '#1e40af', // Darker blue
      'Green': '#047857', // Darker green
      'Red': '#ef4444',
      'Gray': '#6b7280',
      'Yellow': '#f59e0b',
      'Purple': '#8b5cf6',
      'Pink': '#ec4899',
      'Orange': '#f97316'
    };
    return colorMap[color] || '#6b7280';
  };

  const findVariantByAttributes = (color?: string, size?: string) => {
    return variants.find(variant => {
      const hasMatchingColor = !color || variant.ProductVariantAttribute?.some(
        attr => attr.attribute.type === 'COLOR' && attr.value === color
      );
      const hasMatchingSize = !size || variant.ProductVariantAttribute?.some(
        attr => attr.attribute.type === 'SIZE' && attr.value === size
      );
      return hasMatchingColor && hasMatchingSize;
    });
  };

  const getSelectedAttributes = () => {
    if (!selectedVariantId) return { color: null, size: null };
    
    const selectedVariant = variants.find(v => v.id === selectedVariantId);
    if (!selectedVariant) return { color: null, size: null };
    
    const color = selectedVariant.ProductVariantAttribute?.find(
      attr => attr.attribute.type === 'COLOR'
    )?.value || null;
    
    const size = selectedVariant.ProductVariantAttribute?.find(
      attr => attr.attribute.type === 'SIZE'
    )?.value || null;
    
    return { color, size };
  };

  const selectedAttributes = getSelectedAttributes();

  const handleColorSelect = (color: string) => {
    const variant = findVariantByAttributes(color, selectedAttributes.size || undefined);
    if (variant) {
      onVariantSelect(variant.id);
    }
  };

  const handleSizeSelect = (size: string) => {
    const variant = findVariantByAttributes(selectedAttributes.color || undefined, size);
    if (variant) {
      onVariantSelect(variant.id);
    }
  };

  return (
    <div className="mb-5">
      {uniqueColors.length > 0 && (
        <>
          <h3 className="text-sm font-medium mb-3 uppercase">Color</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {uniqueColors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`w-6 h-6 flex items-center justify-center focus:outline-none rounded border border-black ${
                  selectedAttributes.color === color ? 'ring-2 ring-gray-400' : ''
                }`}
                title={color}
                aria-label={`Select ${color} color`}
              >
                <span
                  className="w-5 h-5 rounded"
                  style={{ backgroundColor: getColorBackground(color) }}
                ></span>
              </button>
            ))}
          </div>
        </>
      )}

      {uniqueSizes.length > 0 && (
        <>
          <h3 className="text-sm font-medium mb-3 uppercase">Size</h3>
          <div className="flex flex-wrap gap-2">
            {uniqueSizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeSelect(size)}
                className={`w-10 h-10 rounded border flex items-center justify-center text-sm font-medium ${
                  selectedAttributes.size === size
                    ? 'border-black bg-black text-white'
                    : 'border-black bg-white hover:border-gray-600'
                }`}
                title={size}
                aria-label={`Select ${size} size`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
