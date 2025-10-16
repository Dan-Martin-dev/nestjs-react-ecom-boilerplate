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
      name: 'HEAVYWEIGHT WHITE TEE',
      slug: 'heavyweight-white-tee',
      description: '275 GSM JERSEY',
      price: 35.00,
      images: [
        {
          url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=360',
          altText: 'Heavyweight White T-Shirt',
          isDefault: true,
          format: ImageFormat.JPEG,
          isVector: false,
          printResolution: 300,
          usage: [ImageUsage.PRINT, ImageUsage.WEB],
        },
      ],
      // Connect to global color attribute
      globalAttributeValues: [whiteColor.id],
      // Create variants for all sizes in white
      variants: sizes.map(size => ({
        name: `White / ${size.value}`,
        sku: `HW-WHT-${size.value}`,
        price: 35.00,
        stockQuantity: 100,
        attributes: [
          { attributeId: colorAttribute.id, value: 'White' },
          { attributeId: sizeAttribute.id, value: size.value },
        ],
      })),
    },
    {
      name: 'HEAVYWEIGHT BLACK TEE',
      slug: 'heavyweight-black-tee',
      description: '275 GSM JERSEY',
      price: 35.00,
      images: [
        {
          url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_Black_01_2.jpg?v=1726510061&width=823',
          altText: 'Heavyweight Black T-Shirt',
          isDefault: true,
          format: ImageFormat.JPEG,
          isVector: false,
          printResolution: 300,
          usage: [ImageUsage.PRINT, ImageUsage.WEB],
        },
      ],
      globalAttributeValues: [blackColor.id],
      variants: sizes.map(size => ({
        name: `Black / ${size.value}`,
        sku: `HW-BLK-${size.value}`,
        price: 35.00,
        stockQuantity: 100,
        attributes: [
          { attributeId: colorAttribute.id, value: 'Black' },
          { attributeId: sizeAttribute.id, value: size.value },
        ],
      })),
    },
    {
      name: 'HEAVYWEIGHT BLUE TEE',
      slug: 'heavyweight-blue-tee',
      description: '275 GSM JERSEY',
      price: 35.00,
      images: [
        {
          url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_Navy_01.jpg?v=1726511324&width=823',
          altText: 'Heavyweight Blue T-Shirt',
          isDefault: true,
          format: ImageFormat.JPEG,
          isVector: false,
          printResolution: 300,
          usage: [ImageUsage.PRINT, ImageUsage.WEB],
        },
      ],
      globalAttributeValues: [blueColor.id],
      variants: sizes.map(size => ({
        name: `Blue / ${size.value}`,
        sku: `HW-BLU-${size.value}`,
        price: 35.00,
        stockQuantity: 100,
        attributes: [
          { attributeId: colorAttribute.id, value: 'Blue' },
          { attributeId: sizeAttribute.id, value: size.value },
        ],
      })),
    },
    {
      name: 'HEAVYWEIGHT GREEN TEE',
      slug: 'heavyweight-green-tee',
      description: '275 GSM JERSEY',
      price: 35.00,
      images: [
        {
          url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_OliveDrab_01_1.jpg?v=1726516633&width=360',
          altText: 'Heavyweight Olive Green T-Shirt',
          isDefault: true,
          format: ImageFormat.JPEG,
          isVector: false,
          printResolution: 300,
          usage: [ImageUsage.PRINT, ImageUsage.WEB],
        },
      ],
      globalAttributeValues: [greenColor.id],
      variants: sizes.map(size => ({
        name: `Green / ${size.value}`,
        sku: `HW-GRN-${size.value}`,
        price: 35.00,
        stockQuantity: 100,
        attributes: [
          { attributeId: colorAttribute.id, value: 'Green' },
          { attributeId: sizeAttribute.id, value: size.value },
        ],
      })),
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
