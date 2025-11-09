//
// ----------------- DEPENDENCIES & SETUP -----------------
//
const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const fs = require('fs');
const fsPromises = require('fs/promises');
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
    // Ensure uploads and products directories exist
    [CONFIG.UPLOADS_DIR, PRODUCTS_DIR].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
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
        fsPromises.unlink(destinationPath).catch(() => {});
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
      await fsPromises.rename(tempFilePath, finalFilePath);

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
        await fsPromises.access(fullLocalPath); // Check if file exists and is accessible
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
        name: 'White T-Shirt',
        slug: 'white-t-shirt',
        description: 'A comfortable and versatile white cotton t-shirt available in multiple colors.',
        price: 25.00,
        isActive: true,
        skuPrefix: 'WTS',
        // This will be the parent product
        colors: [
          {
            name: 'Red',
            slug: 'red',
            hexColor: '#FF0000',
            externalImageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop&crop=center',
            altText: 'White T-Shirt in Red'
          },
          {
            name: 'Blue',
            slug: 'blue',
            hexColor: '#0000FF',
            externalImageUrl: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop&crop=center',
            altText: 'White T-Shirt in Blue'
          },
          {
            name: 'Black',
            slug: 'black',
            hexColor: '#000000',
            externalImageUrl: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop&crop=center',
            altText: 'White T-Shirt in Black'
          },
          {
            name: 'Green',
            slug: 'green',
            hexColor: '#00FF00',
            externalImageUrl: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop&crop=center',
            altText: 'White T-Shirt in Green'
          }
        ],
        sizes: ['S', 'M', 'L', 'XL']
      }
    ];

    for (const productData of products) {
      const productVariantsToCreate = [];
      const globalAttributeValuesToConnect = [];

      // Skip product-level image processing - we'll handle images at variant level

      if (productData.colors && productData.sizes) {
        // Handle the new color structure with objects
        for (const colorObj of productData.colors) {
          // Create global attribute value for this color if it doesn't exist
          let colorGlobalValue = await prisma.productAttributeGlobalValue.findFirst({
            where: { attributeId: colorAttribute.id, value: colorObj.name },
          });
          if (!colorGlobalValue) {
            colorGlobalValue = await prisma.productAttributeGlobalValue.create({
              data: {
                value: colorObj.name,
                slug: colorObj.slug,
                attribute: { connect: { id: colorAttribute.id } },
              },
            });
          }
          globalAttributeValuesToConnect.push({ id: colorGlobalValue.id });

          // Download and save color-specific image
          const colorImageData = await processProductImage({
            externalImageUrl: colorObj.externalImageUrl,
            altText: colorObj.altText
          }, `${productData.slug}-${colorObj.slug}`);

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

            const variantName = `${productData.name} - ${colorObj.name} - ${size}`;
            const variantSlug = `${productData.slug}-${colorObj.slug}-${size.toLowerCase()}`;
            const variantSku = `WTS-${colorObj.slug.substring(0, 3).toUpperCase()}-${size.toUpperCase()}`;

            const variantImages = [];
            if (colorImageData) {
              variantImages.push({
                url: colorImageData.url,
                altText: `${productData.name} - ${colorObj.name}`,
                isDefault: true,
                format: colorImageData.format,
                usage: ['WEB', 'GALLERY']
              });
            }

            productVariantsToCreate.push({
              name: variantName,
              slug: variantSlug,
              sku: variantSku,
              price: productData.price,
              stockQuantity: 25, // Stock for each size variant
              // images: variantImages.length > 0 ? { create: variantImages } : undefined,
              ProductVariantAttribute: {
                create: [
                  {
                    attributeId: colorAttribute.id,
                    value: colorObj.name,
                  },
                  {
                    attributeId: sizeAttribute.id,
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
          isActive: productData.isActive ?? true,
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

      // Now create images for each variant
      if (productData.colors && productData.sizes) {
        for (const colorObj of productData.colors) {
          const colorImageData = await processProductImage({
            externalImageUrl: colorObj.externalImageUrl,
            altText: colorObj.altText
          }, `${productData.slug}-${colorObj.slug}`);

          if (colorImageData) {
            // Find the variants for this color
            const colorVariants = await prisma.productVariant.findMany({
              where: {
                productId: product.id,
                ProductVariantAttribute: {
                  some: {
                    attributeId: colorAttribute.id,
                    value: colorObj.name,
                  },
                },
              },
            });

            // Create image for each variant of this color
            for (const variant of colorVariants) {
              await prisma.image.create({
                data: {
                  url: colorImageData.url,
                  altText: `${productData.name} - ${colorObj.name}`,
                  isDefault: true,
                  format: 'JPEG',
                  usage: ['WEB', 'GALLERY'],
                  productId: product.id,
                  variantId: variant.id,
                },
              });
            }
          }
        }
      }

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
