
## Auth Module

### src/auth/dto/register.dto.ts
```typescript
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
```

### src/auth/dto/login.dto.ts
```typescript
import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginDto = z.infer<typeof LoginSchema>;
```

### src/auth/auth.controller.ts
```typescript
import { Controller, Post, Body, UsePipes } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RegisterDto, RegisterSchema } from './dto/register.dto';
import { LoginDto, LoginSchema } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

### src/auth/auth.service.ts
```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      user,
      access_token: token,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      access_token: token,
    };
  }
}
```

---

## Products Module

### src/products/dto/create-product.dto.ts
```typescript
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    altText: z.string().optional(),
    isDefault: z.boolean().default(false),
  })).optional(),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    sku: z.string().min(1, 'SKU is required'),
    price: z.number().positive('Variant price must be positive'),
    stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
    attributes: z.array(z.object({
      attributeId: z.string(),
      value: z.string(),
    })).optional(),
  })).min(1, 'At least one variant is required'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
```

### src/products/dto/product-filter.dto.ts
```typescript
import { z } from 'zod';

export const ProductFilterSchema = z.object({
  categoryId: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  search: z.string().optional(),
  inStock: z.coerce.boolean().optional(),
  sortBy: z.enum(['price', 'name', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(12),
});

export type ProductFilterDto = z.infer<typeof ProductFilterSchema>;
```

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
  Body, 
  Patch, 
  Param, 
  Query,
  UseGuards,
  UsePipes, 
  Request 
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, OrderStatus } from '@prisma/client';
import { CreateOrderDto, CreateOrderSchema } from './dto/create-order.dto';
import { PaginationDto, PaginationSchema } from '../common/dto/pagination.dto';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateOrderSchema))
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.sub, createOrderDto);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findUserOrders(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.ordersService.findUserOrders(req.user.sub, paginationDto);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findAllOrders(@Query() paginationDto: PaginationDto) {
    return this.ordersService.findAllOrders(paginationDto);
  }

  @Get(':orderNumber')
  findOne(@Request() req, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.findOne(req.user.sub, orderNumber, req.user.role);
  }

  @Patch(':orderNumber/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateOrderStatus(
    @Param('orderNumber') orderNumber: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(orderNumber, status);
  }

  @Post(':orderNumber/cancel')
  cancelOrder(@Request() req, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.cancelOrder(req.user.sub, orderNumber);
  }
}
```

### src/orders/orders.service.ts
```typescript
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { OrderStatus, PaymentStatus, InventoryChangeType, Role } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createOrderDto: CreateOrderDto) {
    const { shippingAddressId, billingAddressId, paymentMethod, notes, discountCode } = createOrderDto;

    // Verify addresses belong to user
    const [shippingAddress, billingAddress] = await Promise.all([
      this.prisma.address.findFirst({
        where: { id: shippingAddressId, userId },
      }),
      this.prisma.address.findFirst({
        where: { id: billingAddressId, userId },
      }),
    ]);

    if (!shippingAddress || !billingAddress) {
      throw new BadRequestException('Invalid address provided');
    }

    // Get user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Verify stock availability
    for (const item of cart.items) {
      if (item.productVariant.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.productVariant.product.name}`,
        );
      }
    }

    // Calculate total amount
    let totalAmount = cart.items.reduce(
      (total, item) => total + Number(item.priceAtAddition) * item.quantity,
      0,
    );

    // Apply discount if provided
    let appliedDiscount = null;
    if (discountCode) {
      const discount = await this.prisma.discount.findUnique({
        where: { 
          code: discountCode,
          isActive: true,
        },
      });

      if (discount && this.isDiscountValid(discount)) {
        appliedDiscount = discount;
        
        if (discount.type === 'PERCENTAGE') {
          totalAmount = totalAmount * (1 - Number(discount.value) / 100);
        } else {
          totalAmount = Math.max(0, totalAmount - Number(discount.value));
        }

        // Update discount usage
        await this.prisma.discount.update({
          where: { id: discount.id },
          data: { timesUsed: { increment: 1 } },
        });
      }
    }

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          shippingAddressId,
          billingAddressId,
          totalAmount,
          notes,
          appliedDiscountId: appliedDiscount?.id,
          items: {
            create: cart.items.map(item => ({
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtAddition,
            })),
          },
          payment: {
            create: {
              amount: totalAmount,
              paymentMethod,
              status: PaymentStatus.PENDING,
            },
          },
        },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: true,
                },
              },
            },
          },
          payment: true,
          shippingAddress: true,
          billingAddress: true,
        },
      });

      // Update inventory
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });

        // Log inventory change
        await tx.inventoryLog.create({
          data: {
            productVariantId: item.productVariantId,
            changeType: InventoryChangeType.SALE,
            quantity: -item.quantity,
            reason: `Order ${newOrder.orderNumber}`,
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Create initial order tracking
      await tx.orderTracking.create({
        data: {
          orderId: newOrder.id,
          status: 'ORDER_PLACED',
          message: 'Order has been placed successfully',
        },
      });

      return newOrder;
    });

    return order;
  }

  async findUserOrders(userId: string, paginationDto: PaginationDto) {
    const { page, limit, sortBy = 'createdAt', sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      images: {
                        where: { isDefault: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          payment: true,
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllOrders(paginationDto: PaginationDto) {
    const { page, limit, sortBy = 'createdAt', sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          items: {
            include: {
              productVariant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          payment: true,
        },
      }),
      this.prisma.order.count(),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, orderNumber: string, userRole: Role) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
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
        payment: true,
        shippingAddress: true,
        billingAddress: true,
        appliedDiscount: true,
        OrderTracking: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Users can only view their own orders, admins can view all
    if (userRole !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async updateOrderStatus(orderNumber: string, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { orderNumber },
      data: { status },
    });

    // Create order tracking entry
    await this.prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: this.mapOrderStatusToTrackingStatus(status),
        message: `Order status updated to ${status}`,
      },
    });

    return updatedOrder;
  }

  async cancelOrder(userId: string, orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    // Update order status and restore inventory
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });

      // Restore inventory
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stockQuantity: { increment: item.quantity },
          },
        });

        // Log inventory change
        await tx.inventoryLog.create({
          data: {
            productVariantId: item.productVariantId,
            changeType: InventoryChangeType.RETURN,
            quantity: item.quantity,
            reason: `Order ${orderNumber} cancelled`,
          },
        });
      }

      // Create tracking entry
      await tx.orderTracking.create({
        data: {
          orderId: order.id,
          status: 'EXCEPTION',
          message: 'Order has been cancelled by customer',
        },
      });
    });

    return { message: 'Order cancelled successfully' };
  }

  private isDiscountValid(discount: any): boolean {
    const now = new Date();
    
    if (discount.startDate && now < discount.startDate) return false;
    if (discount.endDate && now > discount.endDate) return false;
    if (discount.usageLimit && discount.timesUsed >= discount.usageLimit) return false;
    
    return true;
  }

  private mapOrderStatusToTrackingStatus(status: OrderStatus) {
    const mapping = {
      [OrderStatus.PENDING]: 'ORDER_PLACED',
      [OrderStatus.PROCESSING]: 'PROCESSING',
      [OrderStatus.SHIPPED]: 'SHIPPED',
      [OrderStatus.DELIVERED]: 'DELIVERED',
      [OrderStatus.CANCELLED]: 'EXCEPTION',
      [OrderStatus.REFUNDED]: 'EXCEPTION',
    };
    
    return mapping[status] || 'ORDER_PLACED';
  }
}
```

---

## Categories Module

### src/categories/dto/create-category.dto.ts
```typescript
import { z } from 'zod';

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
```

### src/categories/categories.controller.ts
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
  UsePipes 
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CreateCategoryDto, CreateCategorySchema } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ZodValidationPipe(CreateCategorySchema))
  create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  getCategoryTree() {
    return this.categoriesService.getCategoryTree();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateCategoryDto: any) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
```

### src/categories/categories.service.ts
```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { parentId, ...categoryData } = createCategoryDto;

    // Verify parent category exists if provided
    if (parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: parentId, deletedAt: null },
      });

      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: {
        ...categoryData,
        parentId,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
        },
        _count: {
          select: {
            Product: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getCategoryTree() {
    const categories = await this.prisma.category.findMany({
      where: { 
        deletedAt: null,
        parentId: null, // Root categories only
      },
      include: {
        children: {
          where: { deletedAt: null },
          include: {
            children: {
              where: { deletedAt: null },
              include: {
                _count: {
                  select: {
                    Product: true,
                  },
                },
              },
            },
            _count: {
              select: {
                Product: true,
              },
            },
          },
        },
        _count: {
          select: {
            Product: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
        },
        Product: {
          where: { 
            isActive: true,
            deletedAt: null,
          },
          include: {
            images: {
              where: { isDefault: true },
              take: 1,
            },
            variants: {
              take: 1,
              orderBy: {
                price: 'asc',
              },
            },
          },
          take: 12,
        },
        _count: {
          select: {
            Product: {
              where: {
                isActive: true,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug, deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
        },
        _count: {
          select: {
            Product: {
              where: {
                isActive: true,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: any) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
      include: {
        children: {
          where: { deletedAt: null },
        },
        Product: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children.length > 0) {
      throw new BadRequestException('Cannot delete category with subcategories');
    }

    if (category.Product.length > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    // Soft delete
    return this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
```

---

## Reviews Module

### src/reviews/dto/create-review.dto.ts
```typescript
import { z } from 'zod';

export const CreateReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().optional(),
});

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;
```

### src/reviews/reviews.controller.ts
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
  UsePipes, 
  Request 
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthGuard } from '../common/guards/auth.guard';
import { CreateReviewDto, CreateReviewSchema } from './dto/create-review.dto';
import { PaginationDto, PaginationSchema } from '../common/dto/pagination.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(CreateReviewSchema))
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(req.user.sub, createReviewDto);
  }

  @Get('product/:productId')
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findProductReviews(
    @Param('productId') productId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.reviewsService.findProductReviews(productId, paginationDto);
  }

  @Get('user')
  @UseGuards(AuthGuard)
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findUserReviews(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.reviewsService.findUserReviews(req.user.sub, paginationDto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(@Request() req, @Param('id') id: string, @Body() updateReviewDto: any) {
    return this.reviewsService.update(req.user.sub, id, updateReviewDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Request() req, @Param('id') id: string) {
    return this.reviewsService.remove(req.user.sub, id);
  }
}
```

### src/reviews/reviews.service.ts
```typescript
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { productId, rating, comment } = createReviewDto;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user has purchased this product
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productVariant: {
          productId,
        },
        order: {
          userId,
          status: 'DELIVERED',
        },
      },
    });

    if (!hasPurchased) {
      throw new BadRequestException('You can only review products you have purchased');
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    return this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findProductReviews(productId: string, paginationDto: PaginationDto) {
    const { page, limit, sortBy = 'createdAt', sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [reviews, total, averageRating] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where: { productId } }),
      this.prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Get rating distribution
    const ratingDistribution = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true },
      orderBy: { rating: 'desc' },
    });

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        averageRating: averageRating._avg.rating || 0,
        totalReviews: averageRating._count.rating,
        ratingDistribution: ratingDistribution.reduce((acc, item) => {
          acc[item.rating] = item._count.rating;
          return acc;
        }, {} as Record<number, number>),
      },
    };
  }

  async findUserReviews(userId: string, paginationDto: PaginationDto) {
    const { page, limit, sortBy = 'createdAt', sortOrder } = paginationDto;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                where: { isDefault: true },
                take: 1,
              },
            },
          },
        },
      }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(userId: string, reviewId: string, updateReviewDto: any) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.prisma.review.delete({