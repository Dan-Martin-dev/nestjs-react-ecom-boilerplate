const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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

    // Create or upsert ProductAttribute for Color
    const colorAttribute = await prisma.productAttribute.upsert({
      where: { name_type: { name: 'Color', type: 'COLOR' } },
      update: {},
      create: {
        name: 'Color',
        type: 'COLOR',
      },
    });

    // Create or upsert ProductAttribute for Size
    const sizeAttribute = await prisma.productAttribute.upsert({
      where: { name_type: { name: 'Size', type: 'SIZE' } },
      update: {},
      create: {
        name: 'Size',
        type: 'SIZE',
      },
    });

    // Create products
    const products = [
      {
        name: '1009 HEAVYWEIGHT T-SHIRT',
        slug: 'heavyweight-t-shirt-black',
        description: 'Premium heavyweight cotton t-shirt',
        price: 35.00,
        externalImageUrl: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=360',
        altText: '1009 Heavyweight T-Shirt Black',
        skuPrefix: '1009-HWT',
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
        externalImageUrl: 'https://www.houseofblanks.com/cdn/shop/files/MidweightTshirt_White_01.jpg?v=1726669963&width=360',
        altText: '1009 Heavyweight T-Shirt White',
        skuPrefix: '1009-HWT',
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
        externalImageUrl: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_HeatherGrey_01_2.jpg?v=1726511909&width=360',
        altText: '1008 Midweight T-Shirt White',
        skuPrefix: '1008-MWT',
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
        externalImageUrl: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_02_1.jpg?v=1726516823&width=360',
        altText: '1009 Heavyweight T-Shirt Heather Grey',
        skuPrefix: '1009-HWT',
        variants: [
          {
            name: 'Heather Grey',
            sku: '1009-HGR',
            price: 35.00,
            stockQuantity: 100,
          },
        ],
      },
      {
        name: 'Basic T-Shirt',
        slug: 'basic-tshirt',
        description: 'A comfortable and versatile basic t-shirt.',
        price: 19.99,
        externalImageUrl: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=360', // Placeholder image
        altText: 'Basic T-Shirt',
        skuPrefix: 'BAS-T',
        colors: ['black', 'white', 'heather-grey', 'navy'],
        sizes: ['S', 'M', 'L', 'XL'],
      },
    ];

    for (const productData of products) {
      const productVariantsToCreate = [];
      const globalAttributeValuesToConnect = [];

      if (productData.colors && productData.sizes) {
        for (const color of productData.colors) {
          // Use global attribute values (reusable across products)
          let colorGlobalValue = await prisma.productAttributeGlobalValue.findFirst({
            where: { attributeId: colorAttribute.id, value: color },
          });
          if (!colorGlobalValue) {
            colorGlobalValue = await prisma.productAttributeGlobalValue.create({
              data: {
                value: color,
                slug: color,
                attribute: { connect: { id: colorAttribute.id } },
              },
            });
          }
          globalAttributeValuesToConnect.push({ id: colorGlobalValue.id });

          for (const size of productData.sizes) {
            let sizeGlobalValue = await prisma.productAttributeGlobalValue.findFirst({
              where: { attributeId: sizeAttribute.id, value: size },
            });
            if (!sizeGlobalValue) {
              sizeGlobalValue = await prisma.productAttributeGlobalValue.create({
                data: {
                  value: size,
                  slug: size.toLowerCase(),
                  attribute: { connect: { id: sizeAttribute.id } },
                },
              });
            }
            globalAttributeValuesToConnect.push({ id: sizeGlobalValue.id });

            const variantName = `${productData.name} - ${color} - ${size}`;
            const variantSlug = `${productData.slug}-${color.toLowerCase()}-${size.toLowerCase()}`;
            const variantSku = `${productData.skuPrefix}-${color.substring(0, 3).toUpperCase()}-${size.toUpperCase()}`;

            productVariantsToCreate.push({
              name: variantName,
              slug: variantSlug,
              sku: variantSku,
              price: productData.price,
              stockQuantity: 50, // Default stock for each variant
              ProductVariantAttribute: {
                create: [
                  {
                    attribute: { connect: { id: colorAttribute.id } },
                    value: color,
                  },
                  {
                    attribute: { connect: { id: sizeAttribute.id } },
                    value: size,
                  },
                ],
              },
            });
          }
        }
      } else if (productData.variants) {
        // Existing logic for simple variants - ensure required fields (slug, stockQuantity)
        const mapped = productData.variants.map((v) => ({
          name: v.name,
          sku: v.sku,
          slug:
            v.slug ||
            `${productData.slug}-${(v.sku || v.name)
              .toString()
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')}`,
          price: v.price,
          stockQuantity: v.stockQuantity ?? 0,
          // preserve any attributes if present
          attributes: v.attributes ? { create: v.attributes } : undefined,
        }));
        productVariantsToCreate.push(...mapped);
      }

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
          globalAttributeValues: {
            connect: globalAttributeValuesToConnect,
          },
          variants: {
            create: productVariantsToCreate,
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
