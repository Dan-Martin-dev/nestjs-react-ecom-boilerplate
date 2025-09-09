// -------------------------
// Imports
// -------------------------
import React from 'react';
import { Link } from 'react-router-dom';
import '../../auth/styles/auth-fonts.css';

// -------------------------
// Types
// -------------------------
type Product = {
  id: string;
  title: string;
  href: string;
  img: string;
  alt?: string;
  price?: string;
  badge?: string;
};

// -------------------------
// Sample product data (placeholder)
// Replace with real product data when wiring to API
// -------------------------
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1009-black',
  title: '1009 HEAVYWEIGHT T-SHIRT',
    href: '/products/heavyweight-t-shirt-black',
    img: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=360',
    alt: 'WHITE',
    price: '$35',
    badge: 'BUY 3 - SAVE 10%',
  },
  {
    id: '1009-white',
  title: '1009 HEAVYWEIGHT T-SHIRT',
    href: '/products/heavyweight-t-shirt-white',
    img: 'https://www.houseofblanks.com/cdn/shop/files/MidweightTshirt_White_01.jpg?v=1726669963&width=360',
    alt: 'WHITE',
    price: '$35',
    badge: 'BUY 3 - SAVE 10%',
  },
  {
    id: '1008-white',
  title: '1008 MIDWEIGHT T-SHIRT',
    href: '/products/midweight-t-shirt-white',
    img: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_HeatherGrey_01_2.jpg?v=1726511909&width=360',
    alt: 'HEATHER GREY',
    price: '$30',
    badge: 'BUY 3 - SAVE 10%',
  },
  {
    id: '1009-grey',
  title: '1009 HEAVYWEIGHT T-SHIRT',
    href: '/products/heavyweight-t-shirt-heather-grey',
    img: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_02_1.jpg?v=1726516823&width=360',
    alt: 'WHITE',
    price: '$35',
    badge: 'BUY 3 - SAVE 10%',
  },
];

const BestsellersPage: React.FC = () => {
  return (
    <main className="max-w-6xl mx-auto py-12 px-4 auth-font-inco auth-uppercase">
      {/* ------------------------- */}
      {/* Header */}
      {/* ------------------------- */}
      <header className="mb-6">
        <h2 className="text-2xl font-inco font-medium tracking-wide text-black">BESTSELLERS</h2>
      </header>

      {/* ------------------------- */}
      {/* Product grid */}
      {/* ------------------------- */}
      <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {SAMPLE_PRODUCTS.map((p) => (

          /* ------------------------- */
          /* Single product */
          /* ------------------------- */
          <article key={p.id} className="group">
            
            {/* ------------------------- */}
            {/* Product image (clickable) */}
            {/* Contains the promo badge overlaid on the image */}
            {/* ------------------------- */}
            <Link to={p.href} className="block overflow-hidden bg-white shadow-sm hover:shadow-md">
              <div className="relative pb-[100%] bg-gray-50">
                <img
                  src={p.img}
                  alt={p.alt || p.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                />
                  {/* Promo tag inside image: centered bottom on xs/sm, bottom-right on md+ */}
                  {p.badge && (
                    <span
                      className="absolute z-10 bottom-3 left-1/2 transform -translate-x-1/2 md:left-auto md:right-3 md:translate-x-0 bg-[#3b2b1b] text-white text-sm font-medium rounded-full px-5 md:px-6 py-2 min-w-[10rem] md:min-w-[11rem] flex items-center justify-center shadow-md"
                      aria-hidden={true}
                    >
                      {p.badge}
                    </span>
                  )}
              </div>
            </Link>

            {/* ------------------------- */}
            {/* Title, subtitle and price */}
            {/* ------------------------- */}
            <div className="mt-3">
              {/* Title */}
              <h3 className="text-base md:text-md font-inco font-medium text-gray-900">
                <Link to={p.href} className="hover:underline">
                  {p.title}
                </Link>
              </h3>

              {/* Subtitle (smaller, gray) - uses `alt` when present */}
              {p.alt && (
                <p className="text-sm text-gray-500 mt-1 normal-case">{p.alt}</p>
              )}

              {/* Price */}
              <div className="mt-1 flex items-center justify-between text-sm text-gray-600">
                <span>{p.price}</span>
              </div>
            </div>

          </article>
        ))}
      </section>

      {/* ------------------------- */}
      {/* Footer / View more link */}
      {/* ------------------------- */}
      <footer className="mt-6 text-sm">
        <Link to="/collections/best-sellers" className="text-blue-600 underline">
          View all products in the Best Sellers collection
        </Link>
      </footer>
    </main>
  );
};

export default BestsellersPage;
