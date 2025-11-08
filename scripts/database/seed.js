//
// ----------------- DEPENDENCIES & SETUP -----------------
//
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs/promises'); // Use the promises-based API
const path = require('path');
const crypto = require('crypto');
const { Writable } = require('stream');

// Note: The prisma client is initialized but not used in this specific function.
// This is good practice for a utility function (separation of concerns).
const prisma = new PrismaClient();

//
// ----------------- CONFIGURATION -----------------
// Centralize configuration for easier management.
// In a real app, this might come from environment variables (process.env) or a config file.
const CONFIG = {
  UPLOADS_DIR: path.join(__dirname, '../../uploads'),
  PRODUCTS_SUBDIR: 'products',
};
const PRODUCTS_DIR = path.join(CONFIG.UPLOADS_DIR, CONFIG.PRODUCTS_SUBDIR);

//
// ----------------- INITIALIZATION -----------------
// Async IIFE (Immediately Invoked Function Expression) to handle async setup.
(async () => {
  try {
    await fs.mkdir(PRODUCTS_DIR, { recursive: true });
    console.log(`Ensured directory exists: ${PRODUCTS_DIR}`);
  } catch (error) {
    console.error('Failed to create necessary directories on startup:', error);
    process.exit(1); // Exit if we can't create essential directories
  }
})();

//
// ----------------- HELPER FUNCTIONS -----------------
//

/**
 * Maps a MIME type to a file extension.
 * @param {string} contentType - The content type from the HTTP header (e.g., 'image/jpeg').
 * @returns {string} The corresponding file extension (e.g., '.jpg').
 */
function getExtensionFromContentType(contentType) {
  if (!contentType) return '.jpg'; // Default fallback
  switch (contentType.toLowerCase()) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/gif':
      return '.gif';
    case 'image/webp':
      return '.webp';
    default:
      // Fallback for less common types or just use a generic extension
      return `.${contentType.split('/')[1] || 'jpg'}`;
  }
}

/**
 * Downloads an image from a URL and saves it to a file by streaming.
 * @param {string} url - The URL of the image to download.
 * @param {string} destinationPath - The full path where the image will be saved.
 * @returns {Promise<{format: string}>} An object containing the detected format.
 */
async function downloadImage(url, destinationPath) {
  const response = await axios.get(url, {
    responseType: 'stream', // Use stream for memory efficiency
    timeout: 30000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; EcommerceSeeder/1.0)',
    },
  });

  const fileWriter = fs.createWriteStream(destinationPath);

  // Pipe the response stream to the file writer stream
  response.data.pipe(fileWriter);

  // Return a promise that resolves when the download is complete or rejects on error
  return new Promise((resolve, reject) => {
    fileWriter.on('finish', () => {
      const contentType = response.headers['content-type'];
      const extension = getExtensionFromContentType(contentType);
      const format = extension.toUpperCase().replace('.', '');
      resolve({ format });
    });
    fileWriter.on('error', (error) => {
        // Clean up the partially written file on error
        fs.unlink(destinationPath).catch(() => {});
        reject(error);
    });
  });
}

//
// ----------------- MAIN LOGIC -----------------
//

/**
 * Processes product images by downloading, using a local file, or skipping.
 *
 * @param {object} productData - Product data object.
 * @param {string} [productData.externalImageUrl] - External URL to download.
 * @param {string} [productData.localImagePath] - Path to existing local image (relative to uploads/).
 * @param {string} [productData.altText] - Alt text for the image.
 * @param {string} productData.name - The product name, used as a fallback for altText.
 * @param {string} productSlug - Slug of the product for filename generation.
 * @returns {Promise<object|null>} Image data for database creation or null.
 */
async function processProductImage(productData, productSlug) {
  const { externalImageUrl, localImagePath, altText, name } = productData;

  try {
    // Case 1: External URL provided - download and save locally
    if (externalImageUrl && externalImageUrl.startsWith('http')) {
      console.log(`Downloading image for ${productSlug} from: ${externalImageUrl}`);

      // Generate unique filename to avoid conflicts and long URLs
      const urlHash = crypto.createHash('md5').update(externalImageUrl).digest('hex').substring(0, 8);
      
      // We don't know the extension yet, so we'll download to a temp name first
      const tempFilename = `${productSlug}-${urlHash}.tmp`;
      const tempFilePath = path.join(PRODUCTS_DIR, tempFilename);

      const { format } = await downloadImage(externalImageUrl, tempFilePath);
      const extension = `.${format.toLowerCase()}`;
      
      const finalFilename = `${productSlug}-${urlHash}${extension}`;
      const finalFilePath = path.join(PRODUCTS_DIR, finalFilename);

      // Rename the temp file to its final name with the correct extension
      await fs.rename(tempFilePath, finalFilePath);

      console.log(`Saved image to: ${finalFilePath}`);
      
      return {
        url: `/${path.join(CONFIG.PRODUCTS_SUBDIR, finalFilename)}`,
        altText: altText || name,
        isDefault: true,
        format,
        usage: ['WEB', 'GALLERY'],
      };
    }

    // Case 2: Local image path provided - verify and use existing image
    if (localImagePath) {
      const fullLocalPath = path.join(CONFIG.UPLOADS_DIR, localImagePath);

      try {
        await fs.access(fullLocalPath); // Check if file exists and is accessible
        console.log(`Using existing local image for ${productSlug}: ${localImagePath}`);
        
        return {
          url: `/${localImagePath}`,
          altText: altText || name,
          isDefault: true,
          format: path.extname(localImagePath).toUpperCase().replace('.', ''),
          usage: ['WEB', 'GALLERY'],
        };
      } catch {
        console.warn(`Local image not found for ${productSlug}: ${fullLocalPath}`);
        return null;
      }
    }

    // Case 3: No image source provided
    console.log(`No image source provided for ${productSlug}, skipping image creation.`);
    return null;

  } catch (error) {
    console.error(`Failed to process image for ${productSlug}. Reason:`, error.message);
    return null;
  }
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
      {
        name: 'Premium Hoodie',
        slug: 'premium-hoodie',
        description: 'High-quality hoodie with excellent comfort and style.',
        price: 65.00,
        localImagePath: 'products/premium-hoodie-black.jpg', // Example of using existing local image
        altText: 'Premium Hoodie Black',
        skuPrefix: 'PREM-H',
        variants: [
          {
            name: 'Black',
            sku: 'PREM-H-BLK',
            price: 65.00,
            stockQuantity: 50,
          },
        ],
      },
      {
        name: 'Eco-Friendly Tote Bag',
        slug: 'eco-tote-bag',
        description: 'Sustainable tote bag made from recycled materials.',
        price: 25.00,
        // No image specified - will skip image creation
        altText: 'Eco-Friendly Tote Bag',
        skuPrefix: 'ECO-T',
        variants: [
          {
            name: 'Natural',
            sku: 'ECO-T-NAT',
            price: 25.00,
            stockQuantity: 75,
          },
        ],
      },
    ];

    for (const productData of products) {
      const productVariantsToCreate = [];
      const globalAttributeValuesToConnect = [];
      const productImagesToCreate = [];

      // Process product image
      const imageData = await processProductImage(productData, productData.slug);
      if (imageData) {
        productImagesToCreate.push(imageData);
      }

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
          images: {
            create: productImagesToCreate,
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
