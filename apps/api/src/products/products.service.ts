import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@repo/db';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from '../common/validators';
import { ProductFilterDto } from './dto/product-filter.dto';
import { ProductDtoSchema } from '@repo/shared';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
  ): Promise<import('@repo/db').Product> {
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
          connect: categoryIds.map((id) => ({ id })),
        },
        images: images
          ? {
              create: images.map((img) => ({
                url: img.url,
                altText: img.altText ?? '',
                isDefault: img.isDefault ?? false,
              })),
            }
          : undefined,
        variants: variants
          ? {
              create: variants.map((variant) => ({
                name: variant.name,
                sku: variant.sku,
                price: variant.price.toString(),
                stockQuantity: variant.stockQuantity,
                ProductVariantAttribute: variant.attributes
                  ? {
                      create: variant.attributes.map((attr) => ({
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

  async findAll(filterDto: ProductFilterDto): Promise<{
    data: import('@repo/db').Product[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      categoryId,
      minPrice,
      maxPrice,
      search,
      inStock,
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

  async findVariantAndVerifyStock(
    variantId: string,
    requestedQuantity: number,
  ): Promise<import('@repo/db').ProductVariant> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }
    if (variant.stockQuantity < requestedQuantity) {
      throw new BadRequestException(
        'Not enough stock available for this variant',
      );
    }
    return variant;
  }

  async update(
    id: string,
    updateProductDto: any,
  ): Promise<import('@repo/db').Product> {
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

  // Simple in-memory TTL cache for bestsellers. In production use Redis or another distributed cache.
  private static _bestsellersCache: Map<string, { ts: number; data: any[] }> =
    new Map();
  private static _BestsellersCacheTTL = 1000 * 60 * 10; // 10 minutes

  async getBestsellers(limit = 10, daysWindow?: number) {
    const cacheKey = `bestsellers:limit=${limit}:days=${daysWindow ?? 'all'}`;

    // Return from cache if fresh
    const cached = ProductsService._bestsellersCache.get(cacheKey);
    if (
      cached &&
      Date.now() - cached.ts < ProductsService._BestsellersCacheTTL
    ) {
      return cached.data;
    }

    // Build order filter: only count completed/confirmed orders
    const orderWhere: any = {
      status: { in: ['SHIPPED', 'DELIVERED'] },
    };
    if (daysWindow && Number.isFinite(daysWindow)) {
      orderWhere.createdAt = {
        gte: new Date(Date.now() - daysWindow * 24 * 60 * 60 * 1000),
      };
    }

    // Aggregate order items by productVariantId and sum quantities.
    // The schema stores productVariantId on OrderItem, so we group by that and then roll up to product totals.
    const groups = await this.prisma.orderItem.groupBy({
      by: [Prisma.OrderItemScalarFieldEnum.productVariantId],
      where: {
        order: orderWhere,
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit * 5, // fetch more variants to account for multiple variants per product
    });

    const variantIds = groups.map((g) => g.productVariantId).filter(Boolean);
    if (variantIds.length === 0) {
      ProductsService._bestsellersCache.set(cacheKey, {
        ts: Date.now(),
        data: [],
      });
      return [];
    }

    // Fetch variants to resolve productId for each variant
    const variants = await this.prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: { product: true },
    });

    // Roll up variant totals into product totals
    const productTotals = new Map<string, number>();
    for (const g of groups) {
      const vid = g.productVariantId as string | null;
      const qty = g._sum?.quantity ?? 0;
      if (!vid) continue;
      const variant = variants.find((v) => v.id === vid);
      const pid = variant?.productId;
      if (!pid) continue;
      productTotals.set(pid, (productTotals.get(pid) ?? 0) + qty);
    }

    // Sort products by total quantity desc and take top `limit`
    const sortedProductIds = Array.from(productTotals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([pid]) => pid);

    // Fetch product details preserving includes
    const products = await this.prisma.product.findMany({
      where: { id: { in: sortedProductIds }, isActive: true, deletedAt: null },
      include: {
        images: true,
        variants: { take: 1 },
        _count: { select: { reviews: true } },
      },
    });

    // Map products by id to preserve aggregate ordering
    const productsMap = new Map(products.map((p) => [p.id, p]));
    const ordered = sortedProductIds
      .map((id) => productsMap.get(id))
      .filter(Boolean) as any[];

    // Map to DTOs and validate using Zod
    const dtos = ordered.map((product) => {
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
        variants: (product.variants || []).map((v: any) => ({
          id: v.id,
          name: v.name,
          sku: v.sku,
          price: v.price,
          stockQuantity: v.stockQuantity,
        })),
        _count: product._count,
        createdAt: product.createdAt?.toISOString?.(),
        updatedAt: product.updatedAt?.toISOString?.(),
      };
      return ProductDtoSchema.parse(productDto);
    });

    // Cache result
    ProductsService._bestsellersCache.set(cacheKey, {
      ts: Date.now(),
      data: dtos,
    });

    return dtos;
  }
}
