import React from 'react';
import { Link } from 'react-router-dom';
import '../../auth/styles/auth-fonts.css';
import type { Product as SharedProduct } from '@repo/shared';
import { useAllProducts } from '../hooks/useAllProducts';
import { IconLoader2 } from '@tabler/icons-react';

const ProductsPage: React.FC = () => {
  const { data: products, isLoading, error } = useAllProducts(8);

  return (
    <div className="bg-gray-50 min-h-screen auth-font-inco">
      <main className="max-w-6xl mx-auto py-12 px-4 auth-uppercase font-inco">
      {/* ------------------------- */}
      {/* Header */}
      {/* ------------------------- */}
      <header className="mb-6">
        <h2 className="text-2xl font-inco font-medium tracking-wide text-black">BESTSELLERS</h2>
      </header>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <IconLoader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      )}

      {/* Error State */} 
      {error && (
        <div className="text-red-600 bg-red-50 p-4 rounded-md mb-6">
          Unable to load products. Please try again later.
        </div>
      )}

      {/* ------------------------- */}
      {/* Product grid */}
      {/* ------------------------- */}
      {isLoading && !error && (
        <div className="flex items-center justify-center p-8">
          <IconLoader2 className="w-8 h-8 animate-spin text-gray-600" />
        </div>
      )}
      {products && products.length > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {products.map((p: SharedProduct) => {
            const defaultImage = p.images?.find((i) => i.isDefault) ?? p.images?.[0];
            const badge = ""; // For now, hardcode the badge as in House of Blanks
            const titleWithBadge = badge ? `${p.name} ${badge}` : p.name;

            return (
              <article key={p.id} className="group">
                <Link to={`/products/${p.slug}`} className="block overflow-hidden bg-white shadow-sm hover:shadow-md">
                  <div className="relative pb-[125%] sm:pb-[100%] bg-gray-50">
                    <img
                      src={defaultImage?.url ?? ''}
                      alt={defaultImage?.altText ?? p.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />

                    {/* Promo tag inside image: centered bottom on xs/sm, bottom-right on md+ */}
                    {badge && (
                      <span
                        className="hidden md:block absolute z-10 bottom-3 left-1/2 transform -translate-x-1/2 md:left-auto md:right-3 md:translate-x-0 bg-[#3b2b1b] text-white text-sm font-medium rounded-full px-5 md:px-6 py-2 min-w-[10rem] md:min-w-[11rem] flex items-center justify-center shadow-md"
                        aria-hidden={true}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                </Link>
                
                <div className="mt-2">

                  {/* title */}
                  <h3 className="font-inco font-medium text-[18px] md:text-[21.6px] text-gray-900 leading-tight">
                    <Link to={`/products/${p.slug}`} className="hover:underline">
                      {titleWithBadge}
                    </Link>
                  </h3>
                  
                  {/* description */}
                  {p.description && (
                    <p className="font-inco text-gray-500 tracking-wide uppercase text-[12px] md:text-[14.4px] mt-0.5">{p.description}</p>
                  )}

                  <div className="mt-0.5 flex items-center justify-between text-sm text-gray-600">
                    <span>${p.price}</span>
                  </div>

                  {/* Color variants */}
                  {p.variants && p.variants.length > 1 && (
                    <div className="mt-2 flex gap-1">
                      {(() => {
                        // Group variants by color and get unique colors
                        const colorVariants = p.variants.reduce((acc, variant) => {
                          const colorAttr = variant.ProductVariantAttribute?.find(
                            attr => attr.attribute.type === 'COLOR'
                          );
                          if (colorAttr) {
                            const color = colorAttr.value;
                            if (!acc[color]) {
                              acc[color] = [];
                            }
                            acc[color].push(variant);
                          }
                          return acc;
                        }, {} as Record<string, typeof p.variants>);

                        // Get unique colors and their first variant (smallest size)
                        const uniqueColors = Object.keys(colorVariants).slice(0, 6).map(color => {
                          const variants = colorVariants[color];
                          // Sort by size (S, M, L, XL, XXL) and take first
                          const sortedVariants = variants.sort((a, b) => {
                            const sizeA = a.ProductVariantAttribute?.find(attr => attr.attribute.type === 'SIZE')?.value || '';
                            const sizeB = b.ProductVariantAttribute?.find(attr => attr.attribute.type === 'SIZE')?.value || '';
                            const sizeOrder = ['S', 'M', 'L', 'XL', 'XXL'];
                            return sizeOrder.indexOf(sizeA) - sizeOrder.indexOf(sizeB);
                          });
                          return {
                            color,
                            variant: sortedVariants[0]
                          };
                        });

                        return uniqueColors.map(({ color, variant }) => {
                          // Map color names to CSS colors (darker green and blue)
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

                          const bgColor = colorMap[color] || '#6b7280'; // Default to gray

                          return (
                            <Link
                              key={variant.id}
                              to={`/products/${variant.slug}`}
                              className="w-4 h-4 border border-black hover:border-gray-600 transition-colors block"
                              style={{ backgroundColor: bgColor }}
                              title={`${color} variant`}
                            />
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}

    </main>
    </div>
  );
};

export default ProductsPage;
