// monorepo-ecom/backend/src/cart/cart.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class CartService {
  // INJECT BOTH SERVICES
  constructor(
    private prisma: PrismaService,
    private productsService: ProductsService, 
  ) {}
  
  async getCart(userId: string): Promise<any> {
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

  async addToCart(userId: string, addToCartDto: AddToCartDto): Promise<any> {
    const { productVariantId, quantity } = addToCartDto;

    const variant = await this.productsService.findVariantAndVerifyStock(
      productVariantId,
      quantity,
    );
    
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

  async updateCartItem(userId: string, itemId: string, quantity: number): Promise<any> {
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

  async removeFromCart(userId: string, itemId: string): Promise<any> {
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

  async clearCart(userId: string): Promise<any> {
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