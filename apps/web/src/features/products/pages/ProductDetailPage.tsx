import { useParams } from 'react-router-dom';
import { useProductBySlug } from '../../../hooks/useProducts';
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
  const { data: productResp, isLoading, error } = useProductBySlug(productId || '');
  const product = productResp as Product | undefined;

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
      />
    </ProductDetailLayout>
  );
}

export default ProductDetailPage;
