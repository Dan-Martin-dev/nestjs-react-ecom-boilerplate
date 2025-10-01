const { prisma } = require('../packages/db');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

// Initialize S3 client for Oracle Object Storage
const s3 = new S3Client({
  region: process.env.ORACLE_REGION || 'us-ashburn-1',
  endpoint: process.env.ORACLE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.ORACLE_ACCESS_KEY,
    secretAccessKey: process.env.ORACLE_SECRET_KEY,
  },
  forcePathStyle: true, // Oracle requires path-style URLs
});

async function downloadImage(url, localPath) {
  const response = await axios.get(url, { responseType: 'arraybuffer' });
  fs.writeFileSync(localPath, response.data);
}

async function uploadImage(localPath, key) {
  const body = fs.readFileSync(localPath);
  const contentType = require('mime').getType(localPath) || 'image/jpeg';

  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.ORACLE_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
      ACL: 'public-read',
    }),
  );

  return `${process.env.CDN_HOST.replace(/\/$/, '')}/${key}`;
}

async function processImage(localPath, productId, variant) {
  const buf = fs.readFileSync(localPath);
  const hash = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12);
  const ext = path.extname(localPath);

  // Upload original
  const originalKey = `products/${productId}/original-${hash}${ext}`;
  const originalUrl = await uploadImage(localPath, originalKey);

  // Create and upload thumbnail
  const thumbBuf = await sharp(buf).resize(300).webp({ quality: 80 }).toBuffer();
  const thumbKey = `products/${productId}/thumb-${hash}.webp`;
  fs.writeFileSync(localPath.replace(ext, '.webp'), thumbBuf);
  const thumbUrl = await uploadImage(localPath.replace(ext, '.webp'), thumbKey);

  return { original: originalUrl, thumbnail: thumbUrl };
}

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
        externalImageUrl: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=360',
        altText: '1009 Heavyweight T-Shirt Black',
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
      // Download image
      const tempDir = path.join(__dirname, 'temp');
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
      const localImagePath = path.join(tempDir, `${productData.slug}.jpg`);
      await downloadImage(productData.externalImageUrl, localImagePath);

      // Process and upload image
      const imageUrls = await processImage(localImagePath, productData.slug, productData.variants[0].name);

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
            create: [
              {
                url: imageUrls.original,
                altText: productData.altText,
                isDefault: true,
              },
              {
                url: imageUrls.thumbnail,
                altText: `${productData.altText} Thumbnail`,
                isDefault: false,
              },
            ],
          },
          variants: {
            create: productData.variants,
          },
        },
      });

      console.log(`Created product: ${product.name} (${product.slug})`);

      // Clean up temp file
      fs.unlinkSync(localImagePath);
      const webpPath = localImagePath.replace('.jpg', '.webp');
      if (fs.existsSync(webpPath)) fs.unlinkSync(webpPath);
    }

    console.log('Seeding completed!');
  } catch (error) {
    console.error('Error seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBestsellers();
