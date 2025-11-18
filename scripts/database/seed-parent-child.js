const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();
const UPLOADS_DIR = path.join(__dirname, '../../uploads/products');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

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

async function seedProductFamily() {
  console.log('🌱 Seeding product family with color variants...');

  try {
    // 1. Create category
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

    // 2. Create global attributes for SIZE (shared across all products)
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

    // 3. Create PARENT product (not sold directly, abstract container)
    const parentProduct = await prisma.product.upsert({
      where: { slug: 't-shirt-collection' },
      update: {},
      create: {
        name: 'T-Shirt Collection',
        slug: 't-shirt-collection',
        description: 'Our classic t-shirt collection available in multiple colors',
        price: 0, // Parent product has no price
        isActive: false, // Not sold directly
        categories: {
          connect: { id: clothingCategory.id },
        },
      },
    });

    console.log(`✅ Created parent product: ${parentProduct.name}`);

    // 4. Create CHILD products (one per color)
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

    for (const colorData of colorProducts) {
      // Download color-specific image
      const imageFilename = `${colorData.slug}.jpg`;
      const localImagePath = await downloadAndSaveImage(colorData.imageUrl, imageFilename);

      // Create child product
      const childProduct = await prisma.product.upsert({
        where: { slug: colorData.slug },
        update: {},
        create: {
          name: colorData.name,
          slug: colorData.slug,
          description: colorData.description,
          price: colorData.price,
          isActive: true,
          categories: {
            connect: { id: clothingCategory.id },
          },
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

      // Create 4 size variants for this color
      for (const size of sizes) {
        const variant = await prisma.productVariant.create({
          data: {
            productId: childProduct.id,
            name: `${colorData.name} - ${size}`,
            slug: `${colorData.slug}-${size.toLowerCase()}`,
            sku: `TSH-${colorData.color.toUpperCase()}-${size}`,
            price: colorData.price,
            stockQuantity: 100,
            ProductVariantAttribute: {
              create: {
                attributeId: sizeAttribute.id,
                value: size,
              },
            },
          },
        });

        console.log(`  ✅ Created variant: ${variant.name} (${variant.sku})`);
      }
    }

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

seedProductFamily();
