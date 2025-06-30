
### src/products/products.controller.ts
```typescript
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  UseGuards,
  UsePipes 
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateProductDto, CreateProductSchema } from './dto/create-product.dto';
import { ProductFilterDto, ProductFilterSchema } from './dto/product-filter.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ZodValidationPipe(CreateProductSchema))
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(ProductFilterSchema))
  findAll(@Query() filterDto: ProductFilterDto) {
    return this.productsService.findAll(filterDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateProductDto: any) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
```

### src/products/products.service.ts
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
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
```

---

## Cart Module

### src/cart/dto/add-to-cart.dto.ts
```typescript
import { z } from 'zod';

export const AddToCartSchema = z.object({
  productVariantId: z.string().min(1, 'Product variant ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type AddToCartDto = z.infer<typeof AddToCartSchema>;
```

### src/cart/cart.controller.ts
```typescript
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  UsePipes,
  Request 
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthGuard } from '../common/guards/auth.guard';
import { AddToCartDto, AddToCartSchema } from './dto/add-to-cart.dto';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req) {
    return this.cartService.getCart(req.user.sub);
  }

  @Post('items')
  @UsePipes(new ZodValidationPipe(AddToCartSchema))
  addToCart(@Request() req, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.sub, addToCartDto);
  }

  @Patch('items/:itemId')
  updateCartItem(
    @Request() req,
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateCartItem(req.user.sub, itemId, quantity);
  }

  @Delete('items/:itemId')
  removeFromCart(@Request() req, @Param('itemId') itemId: string) {
    return this.cartService.removeFromCart(req.user.sub, itemId);
  }

  @Delete()
  clearCart(@Request() req) {
    return this.cartService.clearCart(req.user.sub);
  }
}
```

### src/cart/cart.service.ts
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
                ProductVariantAttribute: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: {
                    include: {
                      images: true,
                    },
                  },
                  ProductVariantAttribute: {
                    include: {
                      attribute: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { productVariantId, quantity } = addToCartDto;

    // Check if variant exists and has enough stock
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: productVariantId },
      include: { product: true },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (variant.stockQuantity < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    // Get or create cart
    let cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId },
      });
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productVariantId: {
          cartId: cart.id,
          productVariantId,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;
      
      if (variant.stockQuantity < newQuantity) {
        throw new BadRequestException('Not enough stock available');
      }

      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: {
          productVariant: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      });
    } else {
      // Create new cart item
      return this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productVariantId,
          quantity,
          priceAtAddition: variant.price,
        },
        include: {
          productVariant: {
            include: {
              product: {
                include: {
                  images: true,
                },
              },
            },
          },
        },
      });
    }
  }

  async updateCartItem(userId: string, itemId: string, quantity: number) {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
      include: {
        productVariant: true,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (cartItem.productVariant.stockQuantity < quantity) {
      throw new BadRequestException('Not enough stock available');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: {
        productVariant: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
  }

  async removeFromCart(userId: string, itemId: string) {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        cart: { userId },
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Cart cleared' };
  }
}
```

---

## Orders Module

### src/orders/dto/create-order.dto.ts
```typescript
import { z } from 'zod';
import { PaymentMethod } from '@prisma/client';

export const CreateOrderSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address is required'),
  billingAddressId: z.string().min(1, 'Billing address is required'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
```

### src/orders/orders.controller.ts
```typescript
import { 
  Controller, 
  Get, 
  Post,