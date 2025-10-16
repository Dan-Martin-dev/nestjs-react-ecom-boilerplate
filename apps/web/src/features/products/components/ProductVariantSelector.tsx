import React, { useState, useMemo, useEffect } from 'react';
import type { Product, ProductVariant } from '@repo/shared';

interface ProductVariantSelectorProps {
  product: Product | undefined;
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
}

type AttributeMap = Map<string, {
  id: string;
  name: string;
  type: string;
  values: string[];
}>;

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  product,
  selectedVariant,
  onVariantSelect,
}) => {
  // Track selected attribute values
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>({});

  // Extract all unique attributes from product variants
  const attributes = useMemo(() => {
    if (!product?.variants) return [];
    
    const attrMap: AttributeMap = new Map();
    
    product.variants.forEach(variant => {
      if (variant.ProductVariantAttribute) {
        variant.ProductVariantAttribute.forEach(attr => {
          const attrId = attr.attribute.id;
          if (!attrMap.has(attrId)) {
            attrMap.set(attrId, {
              id: attrId,
              name: attr.attribute.name,
              type: attr.attribute.type,
              values: []
            });
          }
          
          // Add value if not already in the list
          const value = attr.value;
          const values = attrMap.get(attrId)!.values;
          if (!values.includes(value)) {
            values.push(value);
          }
        });
      }
    });
    
    // Convert map to array sorted by attribute name
    return Array.from(attrMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [product]);

  // When a new attribute value is selected
  const handleAttributeSelect = (attributeId: string, value: string) => {
    const newSelection = {
      ...selectedValues,
      [attributeId]: value
    };
    setSelectedValues(newSelection);
    
    // Find matching variant
    const matchingVariant = findMatchingVariant(newSelection);
    if (matchingVariant) {
      onVariantSelect(matchingVariant);
    }
  };
  
  // Find variant that matches all selected attribute values
  const findMatchingVariant = (values: Record<string, string>): ProductVariant | null => {
    if (!product?.variants) return null;
    
    // Only look for variants if we have some selected values
    const selectedAttributeIds = Object.keys(values);
    if (selectedAttributeIds.length === 0) return null;
    
    return product.variants.find(variant => 
      variant.ProductVariantAttribute && selectedAttributeIds.every(attrId => 
        variant.ProductVariantAttribute!.some(va => 
          va.attribute.id === attrId && va.value === values[attrId]
        )
      )
    ) || null;
  };

  // Get available values for an attribute based on current selections
  const getAvailableValues = (attributeId: string): string[] => {
    if (!product?.variants) return [];
    
    const otherSelections = { ...selectedValues };
    delete otherSelections[attributeId];
    
    const otherSelectedAttrs = Object.keys(otherSelections);
    
    // If no other attributes selected, all values are available
    if (otherSelectedAttrs.length === 0) {
      return attributes.find(a => a.id === attributeId)?.values || [];
    }
    
    // Otherwise, find values that would create valid variants given other selections
    return product.variants
      .filter(variant => 
        variant.ProductVariantAttribute && otherSelectedAttrs.every(attrId => 
          variant.ProductVariantAttribute!.some(va => 
            va.attribute.id === attrId && va.value === otherSelections[attrId]
          )
        )
      )
      .flatMap(v => v.ProductVariantAttribute?.filter(va => va.attribute.id === attributeId).map(va => va.value) || [])
      .filter((value, index, self) => self.indexOf(value) === index); // Unique values
  };
  
  // Set initial variant when component loads or selected variant changes
  useEffect(() => {
    if (!product?.variants || !selectedVariant?.ProductVariantAttribute) return;
    
    // Extract values from selected variant
    const values: Record<string, string> = {};
    
    selectedVariant.ProductVariantAttribute.forEach(attr => {
      values[attr.attribute.id] = attr.value;
    });
    
    setSelectedValues(values);
  }, [product, selectedVariant]);

  // If no attributes are available, don't render anything
  if (attributes.length === 0) return null;

  return (
    <div className="space-y-6">
      {attributes.map(attribute => (
        <div key={attribute.id} className="space-y-3">
          <h3 className="text-sm font-medium uppercase">{attribute.name}</h3>
          
          {/* Different UI based on attribute type */}
          {attribute.type === 'COLOR' ? (
            <div className="flex flex-wrap gap-2">
              {getAvailableValues(attribute.id).map(value => {
                const isSelected = selectedValues[attribute.id] === value;
                const colorCode = getColorCode(value.toLowerCase()); 
                
                return (
                  <button
                    key={value}
                    className={`w-8 h-8 rounded-full border-2 ${
                      isSelected ? 'border-black ring-2 ring-gray-200' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: colorCode }}
                    onClick={() => handleAttributeSelect(attribute.id, value)}
                    aria-label={`Select ${value} color`}
                    title={value}
                  />
                );
              })}
            </div>
          ) : attribute.type === 'SIZE' ? (
            <div className="flex flex-wrap gap-2">
              {getAvailableValues(attribute.id).map(value => {
                const isSelected = selectedValues[attribute.id] === value;
                
                return (
                  <button
                    key={value}
                    className={`h-9 min-w-9 px-3 border ${
                      isSelected 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 hover:border-gray-500'
                    } rounded`}
                    onClick={() => handleAttributeSelect(attribute.id, value)}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {getAvailableValues(attribute.id).map(value => {
                const isSelected = selectedValues[attribute.id] === value;
                
                return (
                  <button
                    key={value}
                    className={`px-3 py-1 border rounded ${
                      isSelected 
                        ? 'border-black bg-black text-white' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    onClick={() => handleAttributeSelect(attribute.id, value)}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Helper function to convert common color names to hex codes
function getColorCode(colorName: string): string {
  const colorMap: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#FF0000',
    blue: '#0000FF',
    green: '#008000',
    yellow: '#FFFF00',
    purple: '#800080',
    pink: '#FFC0CB',
    orange: '#FFA500',
    brown: '#A52A2A',
    grey: '#808080',
    gray: '#808080',
    navy: '#000080',
    // Add more colors as needed
  };
  
  return colorMap[colorName] || '#CCCCCC'; // Default gray if not found
}
