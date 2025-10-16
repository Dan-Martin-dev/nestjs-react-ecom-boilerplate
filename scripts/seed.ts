import { prisma, ImageUsage, ImageFormat } from '../packages/db';

async function seedBestsellers() {
  console.log('Seeding bestsellers products...');

  // Create categories first if they don't exist
  const clothingCategory = await prisma.category.upsert({
    where: { slug: 'clothing' },
    update: {},
    create: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'T-shirts and apparel',
    },
  });

  // Get global attributes
  const colorAttribute = await prisma.productAttribute.findFirst({
    where: { name: 'Color', type: 'COLOR' },
    include: { globalValues: true },
  });

  const sizeAttribute = await prisma.productAttribute.findFirst({
    where: { name: 'Size', type: 'SIZE' },
    include: { globalValues: true },
  });

  if (!colorAttribute || !sizeAttribute) {
    throw new Error('Global attributes not found. Please run seed-global-attributes.ts first.');
  }

  // Get specific global values
  const whiteColor = colorAttribute.globalValues.find(v => v.value === 'White');
  const blackColor = colorAttribute.globalValues.find(v => v.value === 'Black');
  const blueColor = colorAttribute.globalValues.find(v => v.value === 'Blue');
  const greenColor = colorAttribute.globalValues.find(v => v.value === 'Green');

  const sizes = sizeAttribute.globalValues; // S, M, L, XL, XXL

  if (!whiteColor || !blackColor || !blueColor || !greenColor) {
    throw new Error('Required color values not found in global attributes.');
  }

  const products = [
    {
      name: 'HEAVYWEIGHT TEE',
      slug: 'heavyweight-tee',
      description: '275 GSM JERSEY - Available in multiple colors',
      price: 35.00,
      images: [
        {
          url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=360',
          altText: 'Heavyweight T-Shirt',
          isDefault: true,
          format: ImageFormat.JPEG,
          isVector: false,
          printResolution: 300,
          usage: [ImageUsage.PRINT, ImageUsage.WEB],
        },
      ],
      // Connect to all color global attribute values
      globalAttributeValues: [whiteColor.id, blackColor.id, blueColor.id, greenColor.id],
            // Create variants for all colors and sizes
      variants: [
        // White variants
        ...sizes.map(size => ({
          name: `White / ${size.value}`,
          slug: `heavyweight-tee-white-${size.value.toLowerCase()}`,
          sku: `HW-WHT-${size.value}`,
          price: 35.00,
          stockQuantity: 100,
          attributes: [
            { attributeId: colorAttribute.id, value: 'White' },
            { attributeId: sizeAttribute.id, value: size.value },
          ],
        })),
        // Black variants
        ...sizes.map(size => ({
          name: `Black / ${size.value}`,
          slug: `heavyweight-tee-black-${size.value.toLowerCase()}`,
          sku: `HW-BLK-${size.value}`,
          price: 35.00,
          stockQuantity: 100,
          attributes: [
            { attributeId: colorAttribute.id, value: 'Black' },
            { attributeId: sizeAttribute.id, value: size.value },
          ],
        })),
        // Blue variants
        ...sizes.map(size => ({
          name: `Blue / ${size.value}`,
          slug: `heavyweight-tee-blue-${size.value.toLowerCase()}`,
          sku: `HW-BLU-${size.value}`,
          price: 35.00,
          stockQuantity: 100,
          attributes: [
            { attributeId: colorAttribute.id, value: 'Blue' },
            { attributeId: sizeAttribute.id, value: size.value },
          ],
        })),
        // Green variants
        ...sizes.map(size => ({
          name: `Green / ${size.value}`,
          slug: `heavyweight-tee-green-${size.value.toLowerCase()}`,
          sku: `HW-GRN-${size.value}`,
          price: 35.00,
          stockQuantity: 100,
          attributes: [
            { attributeId: colorAttribute.id, value: 'Green' },
            { attributeId: sizeAttribute.id, value: size.value },
          ],
        })),
      ],
    },
  ];

  for (const productData of products) {
    // Create or update product with proper data updates
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        isActive: true,
        // Update images - delete existing and create new ones
        images: {
          deleteMany: {}, // Clear existing images
          create: productData.images,
        },
        // Update global attribute values
        globalAttributeValues: {
          set: productData.globalAttributeValues.map(id => ({ id })),
        },
        // Update variants - delete existing and create new ones
        variants: {
          deleteMany: {}, // Clear existing variants
          create: productData.variants.map(variant => ({
            name: variant.name,
            slug: variant.slug,
            sku: variant.sku,
            price: variant.price,
            stockQuantity: variant.stockQuantity,
            ProductVariantAttribute: {
              create: variant.attributes.map(attr => ({
                attributeId: attr.attributeId,
                value: attr.value,
              })),
            },
          })),
        },
      },
      create: {
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        price: productData.price,
        isActive: true,
        categories: {
          connect: { id: clothingCategory.id },
        },
        images: {
          create: productData.images,
        },
        globalAttributeValues: {
          connect: productData.globalAttributeValues.map(id => ({ id })),
        },
        variants: {
          create: productData.variants.map(variant => ({
            name: variant.name,
            slug: variant.slug,
            sku: variant.sku,
            price: variant.price,
            stockQuantity: variant.stockQuantity,
            ProductVariantAttribute: {
              create: variant.attributes.map(attr => ({
                attributeId: attr.attributeId,
                value: attr.value,
              })),
            },
          })),
        },
      },
    });

    console.log(`Created/updated product: ${product.name} (${product.slug}) with ${productData.variants.length} variants`);
  }

  console.log('Seeding completed!');
}

seedBestsellers()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
