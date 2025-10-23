import { prisma } from '../packages/db';

/**
 * SIMPLE PRODUCT UPDATE SCRIPT
 *
 * This is the easiest way to update product data for development/admin tasks.
 * Just change the productSlug and updates below, then run the script.
 */

async function updateProduct() {
  const productSlug = 'heavyweight-tee'; // Change this to your product slug

  const updates = {
    name: 'HEAVYWEIGHT TEE', // Change this to your new name
    description: 'Algodon peinado premium', // Change this to your new description
  };

  try {
    console.log(`🔍 Finding product: ${productSlug}`);

    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
    });

    if (!product) {
      console.log('❌ Product not found');
      return;
    }

    console.log(`✅ Found product: ${product.name}`);

    const updatedProduct = await prisma.product.update({
      where: { id: product.id },
      data: updates,
    });

    console.log('✅ Product updated successfully!');
    console.log(`📝 New name: ${updatedProduct.name}`);
    console.log(`📝 New description: ${updatedProduct.description}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
updateProduct();
