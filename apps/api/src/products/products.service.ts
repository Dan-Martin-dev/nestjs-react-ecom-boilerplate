import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from '../common/validators';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductDtoSchema } from '@repo/shared/src/schemas/product';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto): Promise<import('@repo/db').Product> {
    const {
      name,
      slug,
      description,
      price,
      categoryIds,
      images,
      variants,
      metaTitle,
      metaDescription,
    } = createProductDto;

    return this.prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: price.toString(),
        metaTitle,
        metaDescription,
        categories: {
          connect: categoryIds.map(id => ({ id })),
        },
        images: images
          ? {
              create: images.map(img => ({
                url: img.url,
                altText: img.altText ?? '',
                isDefault: img.isDefault ?? false,
              })),
            }
          : undefined,
        variants: variants
          ? {
              create: variants.map(variant => ({
                name: variant.name,
                sku: variant.sku,
                price: variant.price.toString(),
                stockQuantity: variant.stockQuantity,
                ProductVariantAttribute: variant.attributes
                  ? {
                      create: variant.attributes.map(attr => ({
                        attributeId: attr.attributeId,
                        value: attr.value,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        categories: true,
        images: true,
        variants: {
          include: {
            ProductVariantAttribute: {
              include: {
                attribute: true,
              },
            },
          },
        },
      },
    });
  }

  async findAll(filterDto: ProductFilterDto): Promise<{ data: import('@repo/db').Product[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const { 
      page, 
      limit, 
      sortBy, 
      sortOrder, 
      categoryId, 
      minPrice, 
      maxPrice, 
      search, 
      inStock 
    } = filterDto;

    const skip = (page - 1) * limit;
    
    const where: any = {
      isActive: true,
      deletedAt: null,
    };

    if (categoryId) {
      where.categories = {
        some: { id: categoryId },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (inStock) {
      where.variants = {
        some: {
          stockQuantity: { gt: 0 },
        },
      };
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          categories: true,
          images: true,
          variants: {
            include: {
              ProductVariantAttribute: {
                include: {
                  attribute: true,
                },
              },
            },
          },
          _count: {
            select: {
              reviews: true,
            },
          },
        },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<import('@repo/db').Product> {
    const product = await this.prisma.product.findUnique({
      where: { id, isActive: true, deletedAt: null },
      include: {
        categories: true,
        images: true,
        variants: {
          include: {
            ProductVariantAttribute: {
              include: {
                attribute: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Track product view
    await this.prisma.productView.create({
      data: {
        productId: id,
      },
    });

    return product;
  }

  async findBySlug(slug: string): Promise<import('@repo/db').Product> {
    const product = await this.prisma.product.findUnique({
      where: { slug, isActive: true, deletedAt: null },
      include: {
        categories: true,
        images: true,
        variants: {
          include: {
            ProductVariantAttribute: {
              include: {
                attribute: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findVariantAndVerifyStock(variantId: string, requestedQuantity: number): Promise<import('@repo/db').ProductVariant> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    if (variant.stockQuantity < requestedQuantity) {
      throw new BadRequestException('Not enough stock available for this variant');
    }
    return variant;
  }

  async update(id: string, updateProductDto: any): Promise<import('@repo/db').Product> {
    // Implementation for updating product
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        categories: true,
        images: true,
        variants: true,
      },
    });
  }

  async remove(id: string): Promise<import('@repo/db').Product> {
    // Soft delete
    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
  
  async getBestsellers(limit = 10) {
    // In a real app, this would be based on sales data
    // For now, we'll just return the most recently added products
    const products = await this.prisma.product.findMany({
      take: limit,
      where: {
        isActive: true,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        images: true,
        variants: {
          take: 1,
        },
        _count: {
          select: {
            reviews: true,
          },
        },
      },
    });

    // Map the database entities to DTOs
    return products.map(product => {
      // Map to DTO structure
      const productDto = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description || undefined,
        price: product.price,
        isActive: product.isActive,
        metaTitle: product.metaTitle || undefined,
        metaDescription: product.metaDescription || undefined,
        images: product.images.map((img: any) => ({
          id: img.id,
          url: img.url,
          altText: img.altText || undefined,
          isDefault: img.isDefault,
        })),
        // For validation, convert any to proper type
        variants: product.variants.map((variant: any) => ({
          id: variant.id,
          name: variant.name,
          sku: variant.sku,
          price: variant.price,
          stockQuantity: variant.stockQuantity
        })),
        _count: product._count,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      };

      // Validate with Zod schema
      return ProductDtoSchema.parse(productDto);
    });
  }
}
