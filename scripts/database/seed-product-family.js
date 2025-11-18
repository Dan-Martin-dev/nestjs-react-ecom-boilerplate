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

    // 2. Create global attributes for Color and Size
    const colorAttribute = await prisma.productAttribute.upsert({
      where: { name: 'Color' },
      update: {},
      create: {
        name: 'Color',
        type: 'COLOR',
        isGlobal: true,
      },
    });

    const sizeAttribute = await prisma.productAttribute.upsert({
      where: { name: 'Size' },
      update: {},
      create: {
        name: 'Size',
        type: 'SIZE',
        isGlobal: true,
      },
    });

    console.log(`✅ Created attributes: Color and Size`);

    // 3. Create global attribute values for colors
    const colors = [
      { name: 'Red', slug: 'red', hex: '#FF0000' },
      { name: 'Blue', slug: 'blue', hex: '#0000FF' },
      { name: 'Black', slug: 'black', hex: '#000000' },
      { name: 'Green', slug: 'green', hex: '#008000' },
    ];

    const colorValues = {};
    for (const color of colors) {
      colorValues[color.slug] = await prisma.productAttributeGlobalValue.upsert({
        where: {
          attributeId_slug: {
            attributeId: colorAttribute.id,
            slug: color.slug
          }
        },
        update: {},
        create: {
          attributeId: colorAttribute.id,
          value: color.name,
          slug: color.slug,
          displayOrder: colors.indexOf(color),
        },
      });
    }

    // 4. Create global attribute values for sizes
    const sizes = ['S', 'M', 'L', 'XL'];
    const sizeValues = {};
    for (const size of sizes) {
      const slugValue = size.toLowerCase();
      sizeValues[size] = await prisma.productAttributeGlobalValue.upsert({
        where: {
          attributeId_slug: {
            attributeId: sizeAttribute.id,
            slug: slugValue
          }
        },
        update: {},
        create: {
          attributeId: sizeAttribute.id,
          value: size,
          slug: slugValue,
          displayOrder: sizes.indexOf(size),
        },
      });
    }

    console.log(`✅ Created ${colors.length} color values and ${sizes.length} size values`);

    // 5. Create the SINGLE parent product (Product Family)
    const productFamily = await prisma.product.upsert({
      where: { slug: 'classic-t-shirt' },
      update: {},
      create: {
        name: 'Classic Cotton T-Shirt',
        slug: 'classic-t-shirt',
        description: 'Our classic cotton t-shirt available in multiple colors. Comfortable, durable, and perfect for everyday wear.',
        price: 29.99, // Base price
        isActive: true,
        categories: {
          connect: { id: clothingCategory.id },
        },
        // Link to all available colors for this product
        globalAttributeValues: {
          connect: Object.values(colorValues).map(cv => ({ id: cv.id })),
        },
      },
    });

    console.log(`✅ Created product family: ${productFamily.name}`);

    // 6. Define color-specific data
    const colorData = {
      red: {
        name: 'Classic Red T-Shirt',
        description: 'Bold and vibrant red cotton t-shirt. Perfect for making a statement with comfort.',
        imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800',
      },
      blue: {
        name: 'Ocean Blue T-Shirt',
        description: 'Cool and calming blue cotton t-shirt. A versatile wardrobe essential.',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
      },
      black: {
        name: 'Midnight Black T-Shirt',
        description: 'Sleek and timeless black cotton t-shirt. Goes with everything.',
        imageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800',
      },
      green: {
        name: 'Forest Green T-Shirt',
        description: 'Fresh and natural green cotton t-shirt. Eco-friendly style.',
        imageUrl: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800',
      },
    };

    // 7. Create variants for each color/size combination (16 total variants)
    let variantCount = 0;
    for (const [colorSlug, colorInfo] of Object.entries(colorData)) {
      // Download color-specific image
      const imageFilename = `classic-t-shirt-${colorSlug}.jpg`;
      const localImagePath = await downloadAndSaveImage(colorInfo.imageUrl, imageFilename);

      for (const size of sizes) {
        const variant = await prisma.productVariant.upsert({
          where: {
            slug: `classic-t-shirt-${colorSlug}-${size.toLowerCase()}`
          },
          update: {},
          create: {
            productId: productFamily.id,
            name: `${colorInfo.name} - ${size}`,
            slug: `classic-t-shirt-${colorSlug}-${size.toLowerCase()}`,
            sku: `TSH-${colorSlug.toUpperCase()}-${size}`,
            price: 29.99,
            stockQuantity: 100,
            ProductVariantAttribute: {
              create: [
                {
                  attributeId: colorAttribute.id,
                  value: colorInfo.name,
                  attributeValueId: colorValues[colorSlug].id,
                },
                {
                  attributeId: sizeAttribute.id,
                  value: size,
                  attributeValueId: sizeValues[size].id,
                },
              ],
            },
            // Attach color-specific image to this variant
            images: localImagePath ? {
              create: {
                url: localImagePath,
                altText: `${colorInfo.name} - ${size}`,
                isDefault: true,
              },
            } : undefined,
          },
        });

        variantCount++;
        console.log(`  ✅ Created variant: ${variant.name} (${variant.sku})`);
      }
    }

    console.log('\n🎉 Seeding completed successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - 1 Product Family ("Classic Cotton T-Shirt")`);
    console.log(`   - ${colors.length} Available Colors`);
    console.log(`   - ${sizes.length} Available Sizes per Color`);
    console.log(`   - ${variantCount} Total Variants (${colors.length} × ${sizes.length})`);
    console.log(`\nℹ️  Architecture Benefits:`);
    console.log(`   - Single product manages all color/size combinations`);
    console.log(`   - Each color gets unique PDP: /products/classic-t-shirt-{color}`);
    console.log(`   - Each variant has unique ID for cart purchases`);
    console.log(`   - Easy to manage and scale`);

  } catch (error) {
    console.error('❌ Error seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedProductFamily();