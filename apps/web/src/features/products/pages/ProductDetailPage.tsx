import { useParams } from 'react-router-dom';
import { /* useProductBySlug,  */useProductBySlugWithRelated } from '../../../hooks/useProducts';
import type { Product } from '@repo/shared';
import '../../auth/styles/auth-fonts.css';
import {
  ProductDetailLayout,
  ProductDetailContent,
  LoadingSkeleton,
  ErrorState,
} from '../components';
import { useProductVariant, useQuantity, useProductCart } from '../hooks';
import { getProductImages } from '../utils/productUtils';

function ProductDetailPage() {
  const { productId } = useParams();
  
  // Try to fetch product with related products first
  const { data: productWithRelated, isLoading, error } = useProductBySlugWithRelated(productId || '');
  const product = productWithRelated as (Product & { relatedProducts?: Product[] }) | undefined;
  const relatedProducts = product?.relatedProducts || [];

  const { selectedVariantId, selectedVariant, setSelectedVariantId } = useProductVariant(product);
  const { quantity, increaseQuantity, decreaseQuantity } = useQuantity();
  const { handleAddToCart, isLoading: isAddToCartLoading } = useProductCart();

  const images = getProductImages(product);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || !product) {
    return <ErrorState />;
  }

  const handleAddToCartClick = () => {
    handleAddToCart(selectedVariantId, quantity);
  };

  return (
    <ProductDetailLayout productName={product.name}>
      <ProductDetailContent
        product={product}
        images={images}
        selectedVariant={selectedVariant}
        selectedVariantId={selectedVariantId}
        quantity={quantity}
        onVariantSelect={setSelectedVariantId}
        onIncreaseQuantity={increaseQuantity}
        onDecreaseQuantity={decreaseQuantity}
        onAddToCart={handleAddToCartClick}
        isAddToCartLoading={isAddToCartLoading}
        relatedProducts={relatedProducts}
      />
    </ProductDetailLayout>
  );
}

export default ProductDetailPage;
