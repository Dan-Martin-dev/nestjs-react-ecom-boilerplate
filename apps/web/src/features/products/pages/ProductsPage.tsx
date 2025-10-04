import React from 'react';
import { Link } from 'react-router-dom';
import '../../auth/styles/auth-fonts.css';
import type { Product as SharedProduct } from '@repo/shared';
import { useAllProducts } from '../hooks/useAllProducts';
import { IconLoader2 } from '@tabler/icons-react';

const ProductsPage: React.FC = () => {
  const { data: products, isLoading, error } = useAllProducts(8);

  return (
    <main className="max-w-6xl mx-auto py-12 px-4 auth-font-inco auth-uppercase">
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
            const badge = "BUY 3 - SAVE 10%"; // For now, hardcode the badge as in House of Blanks
            const titleWithBadge = badge ? `${p.name} ${badge}` : p.name;

            return (
              <article key={p.id} className="group">
                <Link to={`/products/${p.slug}`} className="block overflow-hidden bg-white shadow-sm hover:shadow-md">
                  <div className="relative pb-[100%] bg-gray-50">
                    <img
                      src={defaultImage?.url ?? ''}
                      alt={defaultImage?.altText ?? p.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />

                    {/* Promo tag inside image: centered bottom on xs/sm, bottom-right on md+ */}
                    {badge && (
                      <span
                        className="absolute z-10 bottom-3 left-1/2 transform -translate-x-1/2 md:left-auto md:right-3 md:translate-x-0 bg-[#3b2b1b] text-white text-sm font-medium rounded-full px-5 md:px-6 py-2 min-w-[10rem] md:min-w-[11rem] flex items-center justify-center shadow-md"
                        aria-hidden={true}
                      >
                        {badge}
                      </span>
                    )}
                  </div>
                </Link>
                
                <div className="mt-3">

                  {/* title */}
                  <h3 className="text-base md:text- font-inco font-medium text-gray-900">
                    <Link to={`/products/${p.slug}`} className="hover:underline">
                      {titleWithBadge}
                    </Link>
                  </h3>
                  
                  {/* description */}
                  {p.description && (
                    <p className="text-sm text-gray-500 mt-1 normal-case">{p.description}</p>
                  )}

                  <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
                    <span>${p.price}</span>
                  </div>

                  {/* Color variants */}
                  {p.variants && p.variants.length > 1 && (
                    <div className="mt-2 flex gap-1">
                      {p.variants.slice(0, 6).map((variant) => (
                        <div
                          key={variant.id}
                          className="w-4 h-4 rounded-full border border-gray-300 bg-gray-200"
                          title={variant.name}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
      {/* ------------------------- */}
      {/* Footer / View more link   */}
      {/* ------------------------- */}
      <footer className="mt-6 text-sm">
        <Link to="/collections/best-sellers" className="text-blue-600 underline">
          View all products in the Best Sellers collection
        </Link>
      </footer>
    </main>
  );
};

export default ProductsPage;
