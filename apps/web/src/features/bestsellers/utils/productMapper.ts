// Mapper between shared backend Product shape and the UI product shape.
// Place mapping logic here (data layer) so components stay simple and focused.

import type { Product as SharedProduct } from '@repo/shared';

export type UiProduct = {
  id: string;
  title: string;
  href: string;
  img: string;
  alt?: string;
  price?: string;
  badge?: string;
};

export function mapSharedProductToUi(p: SharedProduct): UiProduct {
  const defaultImage = p.images?.find((i) => i.isDefault) ?? p.images?.[0];
  return {
    id: p.id,
    title: p.name,
    href: `/products/${p.slug}`,
    img: defaultImage?.url ?? '',
    alt: defaultImage?.altText ?? p.name,
    price: p.price,
    badge: undefined,
  };
}

// Local SAMPLE UI products for dev / storybook / offline preview.
export const SAMPLE_UI_PRODUCTS: UiProduct[] = [
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

export default mapSharedProductToUi;
