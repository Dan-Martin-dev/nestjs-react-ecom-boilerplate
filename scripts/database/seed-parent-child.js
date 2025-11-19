/**
 * SEED PARENT-CHILD PRODUCT ARCHITECTURE
 *
 * This script creates a parent-child product relationship for t-shirts where:
 * - 1 Parent Product: Abstract container (not sold directly)
 * - 4 Child Products: One per color (Red, Blue, Black, Green) - these ARE sold
 * - 16 Variants: Each child has 4 size variants (S, M, L, XL)
 *
 * WHY THIS ARCHITECTURE?
 * - Parent serves as conceptual grouping (e.g., "T-Shirt Collection")
 * - Each color gets its own product ID for independent cart purchases
 * - Customers can browse colors separately with unique URLs
 * - All colors share the same size options (S, M, L, XL)
 * - Maintains inventory and pricing at the variant level
 *
 * DATABASE RELATIONSHIPS:
 * Product (parent) -> Product (children) -> ProductVariant (sizes)
 * - Parent: isActive=false, price=0 (not purchasable)
 * - Children: isActive=true, unique IDs, individual pricing
 * - Variants: Actual cart items with SKU, stock, and size attributes
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Directory where product images will be stored locally
const UPLOADS_DIR = path.join(__dirname, '../../uploads/products');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Downloads an image from a URL and saves it locally
 * @param {string} url - The image URL to download
 * @param {string} filename - The filename to save as
 * @returns {string|null} - Local path if successful, null if failed
 */
async function downloadAndSaveImage(url, filename) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const buffer = Buffer.from(response.data);
    const filePath = path.join(UPLOADS_DIR, filename);
    await fs.promises.writeFile(filePath, buffer);
    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error.message);
    return null;
  }
}

/**
 * Main seeding function that creates the entire product family
 * Creates: 1 parent + 4 children + 16 variants = 21 total database records
 */
async function seedProductFamily() {
  console.log('🌱 Seeding product family with color variants...');

  try {
    // ========================================
    // STEP 1: CREATE CATEGORY
    // ========================================
    // All products belong to the "Clothing" category
    const clothingCategory = await prisma.category.upsert({
      where: { slug: 'clothing' },
      update: {},
      create: {
        name: 'Clothing',
        slug: 'clothing',
        description: 'Apparel and fashion items',
      },
    });

    console.log(`✅ Created category: ${clothingCategory.name}`);

    // ========================================
    // STEP 2: CREATE SIZE ATTRIBUTE SYSTEM
    // ========================================
    // Create a global "Size" attribute that all products can use
    // This ensures consistent sizing across all t-shirt colors
    const sizeAttribute = await prisma.productAttribute.upsert({
      where: {
        name_type: {
          name: 'Size',
          type: 'SIZE'
        }
      },
      update: {},
      create: {
        name: 'Size',
        type: 'SIZE',
      },
    });

    console.log(`✅ Created attribute: ${sizeAttribute.name}`);

    // Create global size values (S, M, L, XL) that can be reused
    const sizes = ['S', 'M', 'L', 'XL'];
    const sizeValues = {};
    for (const size of sizes) {
      const slugValue = size.toLowerCase();
      sizeValues[size] = await prisma.productAttributeGlobalValue.upsert({
        where: {
          attributeId_value: {
            attributeId: sizeAttribute.id,
            value: size
          }
        },
        update: {},
        create: {
          attributeId: sizeAttribute.id,
          value: size,
          slug: slugValue,
        },
      });
    }

    console.log(`✅ Created ${sizes.length} size values`);

    // ========================================
    // STEP 3: CREATE PARENT PRODUCT
    // ========================================
    // Parent product serves as abstract container - NOT sold directly
    // Customers never see or purchase this product
    const parentProduct = await prisma.product.upsert({
      where: { slug: 't-shirt-collection' },
      update: {},
      create: {
        name: 'T-Shirt Collection',
        slug: 't-shirt-collection',
        description: 'Our classic t-shirt collection available in multiple colors',
        price: 0, // No price because it's not sold
        isActive: false, // Not visible/purchasable in the store
        categories: {
          connect: { id: clothingCategory.id },
        },
      },
    });

    console.log(`✅ Created parent product: ${parentProduct.name}`);

    // ========================================
    // STEP 4: CREATE CHILD PRODUCTS (COLOR VARIANTS)
    // ========================================
    // Each color becomes its own sellable product with unique ID
    // This allows customers to add specific colors to cart independently
    const colorProducts = [
      {
        name: 'Classic Red T-Shirt',
        slug: 'classic-red-t-shirt',
        description: 'Bold and vibrant red cotton t-shirt. Perfect for making a statement with comfort.',
        price: 29.99,
        color: 'Red',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
      },
      {
        name: 'Ocean Blue T-Shirt',
        slug: 'ocean-blue-t-shirt',
        description: 'Cool and calming blue cotton t-shirt. A versatile wardrobe essential.',
        price: 29.99,
        color: 'Blue',
        imageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop',
      },
      {
        name: 'Midnight Black T-Shirt',
        slug: 'midnight-black-t-shirt',
        description: 'Sleek and timeless black cotton t-shirt. Goes with everything.',
        price: 29.99,
        color: 'Black',
        imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop',
      },
      {
        name: 'Forest Green T-Shirt',
        slug: 'forest-green-t-shirt',
        description: 'Fresh and natural green cotton t-shirt. Eco-friendly style.',
        price: 29.99,
        color: 'Green',
        imageUrl: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=800&fit=crop',
      },
    ];

    // Process each color product
    for (const colorData of colorProducts) {
      // Download and save the color-specific image locally
      const imageFilename = `${colorData.slug}.jpg`;
      const localImagePath = await downloadAndSaveImage(colorData.imageUrl, imageFilename);

      // Create the child product (this IS sellable)
      const childProduct = await prisma.product.upsert({
        where: { slug: colorData.slug },
        update: {},
        create: {
          name: colorData.name,
          slug: colorData.slug, // Unique URL for this color
          description: colorData.description,
          price: colorData.price, // Base price for this color
          isActive: true, // This product IS visible and purchasable
          categories: {
            connect: { id: clothingCategory.id },
          },
          // Attach the downloaded image if successful
          images: localImagePath ? {
            create: {
              url: localImagePath,
              altText: `${colorData.name} - Front View`,
              isDefault: true,
            },
          } : undefined,
        },
      });

      console.log(`✅ Created child product: ${childProduct.name} (${childProduct.slug})`);

      // ========================================
      // STEP 5: CREATE SIZE VARIANTS FOR THIS COLOR
      // ========================================
      // Each color needs variants for each size (S, M, L, XL)
      // These are the actual items customers add to cart
      for (const size of sizes) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: childProduct.id, // Links to the color product
            name: `${colorData.name} - ${size}`, // e.g., "Classic Red T-Shirt - M"
            slug: `${colorData.slug}-${size.toLowerCase()}`, // URL-friendly
            sku: `TSH-${colorData.color.toUpperCase()}-${size}`, // Unique stock code
            price: colorData.price, // Inherits base price (could be overridden)
            stockQuantity: 100, // Initial stock for this size/color combo
            // Link this variant to the size attribute
            ProductVariantAttribute: {
              create: {
                attributeId: sizeAttribute.id,
                value: size, // The actual size value (S, M, L, XL)
              },
            },
          },
        });

        console.log(`  ✅ Created variant: ${variant.name} (${variant.sku})`);
      }
    }

    // ========================================
    // SEEDING COMPLETE - SUMMARY
    // ========================================
    console.log('\n🎉 Seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - 1 Parent Product (T-Shirt Collection)`);
    console.log(`   - 4 Child Products (one per color)`);
    console.log(`   - 16 Variants total (4 sizes × 4 colors)`);
    console.log(`\nℹ️  Each color is now an independent product with:`);
    console.log(`   - Unique name and description`);
    console.log(`   - Color-specific images`);
    console.log(`   - Own product page and URL`);
    console.log(`   - Independent cart items`);

  } catch (error) {
    console.error('❌ Error seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the seeding function
seedProductFamily();
