// monorepo-ecom/backend/src/products/products.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductFilterDto } from './dto/product-filter.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const { variants, images, categoryIds, ...productData } = createProductDto;

    return this.prisma.product.create({
      data: {
        ...productData,
        categories: {
          connect: categoryIds.map(id => ({ id })),
        },
        images: {
          create: images || [],
        },
        variants: {
          create: variants.map(variant => ({
            ...variant,
            ProductVariantAttribute: {
              create: variant.attributes?.map(attr => ({
                attributeId: attr.attributeId,
                value: attr.value,
              })) || [],
            },
          })),
        },
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

  async findAll(filterDto: ProductFilterDto) {
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

  async findOne(id: string) {
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

  async findBySlug(slug: string) {
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

  async findVariantAndVerifyStock(variantId: string, requestedQuantity: number) {
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

  async update(id: string, updateProductDto: any) {
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

  async remove(id: string) {
    // Soft delete
    return this.prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
    });
  }
}
