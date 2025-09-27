const { prisma } = require('../packages/db');

async function seedBestsellers() {
  console.log('Seeding bestsellers products...');

  try {
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

    // Create products
    const products = [
      {
        name: '1009 HEAVYWEIGHT T-SHIRT',
        slug: 'heavyweight-t-shirt-black',
        description: 'Premium heavyweight cotton t-shirt',
        price: 35.00,
        images: [
          {
            url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=360',
            altText: '1009 Heavyweight T-Shirt Black',
            isDefault: true,
          },
        ],
        variants: [
          {
            name: 'Black',
            sku: '1009-BLK',
            price: 35.00,
            stockQuantity: 100,
          },
        ],
      },
      {
        name: '1009 HEAVYWEIGHT T-SHIRT',
        slug: 'heavyweight-t-shirt-white',
        description: 'Premium heavyweight cotton t-shirt',
        price: 35.00,
        images: [
          {
            url: 'https://www.houseofblanks.com/cdn/shop/files/MidweightTshirt_White_01.jpg?v=1726669963&width=360',
            altText: '1009 Heavyweight T-Shirt White',
            isDefault: true,
          },
        ],
        variants: [
          {
            name: 'White',
            sku: '1009-WHT',
            price: 35.00,
            stockQuantity: 100,
          },
        ],
      },
      {
        name: '1008 MIDWEIGHT T-SHIRT',
        slug: 'midweight-t-shirt-white',
        description: 'Comfortable midweight cotton t-shirt',
        price: 30.00,
        images: [
          {
            url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_HeatherGrey_01_2.jpg?v=1726511909&width=360',
            altText: '1008 Midweight T-Shirt White',
            isDefault: true,
          },
        ],
        variants: [
          {
            name: 'White',
            sku: '1008-WHT',
            price: 30.00,
            stockQuantity: 100,
          },
        ],
      },
      {
        name: '1009 HEAVYWEIGHT T-SHIRT',
        slug: 'heavyweight-t-shirt-heather-grey',
        description: 'Premium heavyweight cotton t-shirt',
        price: 35.00,
        images: [
          {
            url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_02_1.jpg?v=1726516823&width=360',
            altText: '1009 Heavyweight T-Shirt Heather Grey',
            isDefault: true,
          },
        ],
        variants: [
          {
            name: 'Heather Grey',
            sku: '1009-HGR',
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
  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBestsellers();
