import React from 'react';
import { Link } from 'react-router-dom';
import type { Product, ProductImage, ProductVariant } from '@repo/shared';
import {
  ProductImageCarousel,
  ProductInfo,
  VariantSelector,
  QuantitySelector,
  AddToCartButton,
  ProductAccordion,
} from '../components';

interface ProductDetailContentProps {
  product: Product;
  images: ProductImage[];
  selectedVariant: ProductVariant | null;
  selectedVariantId: string | null;
  quantity: number;
  onVariantSelect: (variantId: string) => void;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onAddToCart: () => void;
  isAddToCartLoading: boolean;
  relatedProducts?: Product[];
}

export const 
ProductDetailContent: React.FC<ProductDetailContentProps> = ({
  product,
  images,
  selectedVariant,
  selectedVariantId,
  quantity,
  onVariantSelect,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onAddToCart,
  isAddToCartLoading,
  relatedProducts = [],
}) => {
  return (
    <>
      <main className="max-w-6xl mx-auto px-4 py-12 lg:grid lg:grid-cols-2 lg:gap-x-12">
        {/* Product Images */}
        <div className="mb-4 lg:mb-0">
          <ProductImageCarousel images={images} productName={product.name} />
        </div>

        {/* Product Details */}
        <div className="lg:pl-10">
          <ProductInfo product={product} selectedVariant={selectedVariant} />

          {/* Variants Selection */}
          {product.variants && product.variants.length > 0 && (
            <VariantSelector
              variants={product.variants}
              selectedVariantId={selectedVariantId}
              onVariantSelect={onVariantSelect}
            />
          )}

          <QuantitySelector
            quantity={quantity}
            onIncrease={onIncreaseQuantity}
            onDecrease={onDecreaseQuantity}
          />

          <AddToCartButton
            onAddToCart={onAddToCart}
            isLoading={isAddToCartLoading}
            disabled={!selectedVariantId}
          />

          <ProductAccordion description={product.description || null} />
        </div>
      </main>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-monos font-medium mb-6 tracking-wide">
            YOU MIGHT ALSO LIKE
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => {
              const relatedImage = relatedProduct.images?.find(img => img.isDefault) || relatedProduct.images?.[0];
              const relatedPrice = relatedProduct.variants?.[0]?.price ?? relatedProduct.price;

              return (
                <article key={relatedProduct.id} className="group">
                  <Link
                    to={`/products/${relatedProduct.slug}`}
                    className="block overflow-hidden bg-white shadow-sm hover:shadow-md"
                  >
                    <div className="relative pb-[125%] sm:pb-[100%] bg-gray-50">
                      <img
                        src={relatedImage?.url ?? ''}
                        alt={relatedImage?.altText ?? relatedProduct.name}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </Link>

                  <div className="mt-2">
                    <h3 className="font-monos font-medium text-[16px] md:text-[18px] text-gray-900 leading-tight">
                      <Link to={`/products/${relatedProduct.slug}`} className="hover:underline">
                        {relatedProduct.name}
                      </Link>
                    </h3>

                    {relatedProduct.description && (
                      <p className="font-monos text-gray-500 tracking-wide uppercase text-[12px] md:text-[14.4px] mt-0.5 line-clamp-2">
                        {relatedProduct.description}
                      </p>
                    )}

                    <div className="mt-0.5 flex items-center justify-between text-sm text-gray-600">
                      <span>${relatedPrice}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
};
