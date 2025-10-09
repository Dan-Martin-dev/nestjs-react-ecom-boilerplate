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
      variants: [
        {
          name: 'White',
          sku: 'HW-WHT',
          price: 35.00,
          stockQuantity: 100,
        },
      ],
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
      variants: [
        {
          name: 'Black',
          sku: 'HW-BLK',
          price: 35.00,
          stockQuantity: 100,
        },
      ],
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
      variants: [
        {
          name: 'Blue',
          sku: 'HW-BLU',
          price: 35.00,
          stockQuantity: 100,
        },
      ],
    },
    {
      name: 'HEAVYWEIGHT GREEN TEE',
      slug: 'heavyweight-green-tee',
      description: '275 GSM JERSEY',
      price: 35.00,
      images: [
        {
          url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_Olive_01.jpg?v=1726511324&width=823',
          altText: 'Heavyweight Green T-Shirt',
          isDefault: true,
          format: ImageFormat.JPEG,
          isVector: false,
          printResolution: 300,
          usage: [ImageUsage.PRINT, ImageUsage.WEB],
        },
      ],
      variants: [
        {
          name: 'Green',
          sku: 'HW-GRN',
          price: 35.00,
          stockQuantity: 100,
        },
      ],
    },
  ];

  for (const productData of products) {
    // Create product
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
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
        variants: {
          create: productData.variants,
        },
      },
    });

    console.log(`Created product: ${product.name} (${product.slug})`);
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
