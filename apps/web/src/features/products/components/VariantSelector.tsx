import React from 'react';
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
  const colorVariants = variants.filter((v: ProductVariant) => {
    const isColor = v.name.toLowerCase().includes('black') ||
                    v.name.toLowerCase().includes('white') ||
                    v.name.toLowerCase().includes('grey') ||
                    v.name.toLowerCase().includes('navy');
    return isColor;
  });

  const sizeVariants = variants.filter((v: ProductVariant) => {
    const isSize = ['xs', 's', 'm', 'l', 'xl', 'xxl'].includes(v.name.toLowerCase());
    return isSize;
  });

  const getColorBackground = (name: string) => {
    if (name.toLowerCase().includes('black')) return '#000';
    if (name.toLowerCase().includes('white')) return '#fff';
    if (name.toLowerCase().includes('grey')) return '#aaa';
    if (name.toLowerCase().includes('navy')) return '#003366';
    return '#ddd';
  };

  return (
    <div className="mb-5">
      {colorVariants.length > 0 && (
        <>
          <h3 className="text-sm font-medium mb-3 uppercase">Color</h3>
          <div className="flex flex-wrap gap-2 mb-6">
            {colorVariants.map((v: ProductVariant) => (
              <button
                key={v.id}
                onClick={() => onVariantSelect(v.id)}
                className="w-6 h-6 flex items-center justify-center focus:outline-none"
                title={v.name}
                aria-label={`Select ${v.name} color`}
              >
                <span
                  className="w-5 h-5"
                  style={{ backgroundColor: getColorBackground(v.name) }}
                ></span>
              </button>
            ))}
          </div>
        </>
      )}

      {sizeVariants.length > 0 && (
        <>
          <h3 className="text-sm font-medium mb-3 uppercase">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizeVariants.map((v: ProductVariant) => (
              <button
                key={v.id}
                onClick={() => onVariantSelect(v.id)}
                className={`w-10 h-10 rounded border flex items-center justify-center text-sm font-medium ${
                  selectedVariantId === v.id
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
                title={v.name}
                aria-label={`Select ${v.name} size`}
              >
                {v.name.toUpperCase()}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
