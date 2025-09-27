// monorepo-ecom/backend/src/cart/cart.controller.ts
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
  BadRequestException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AddToCartDto, AddToCartSchema } from './dto/add-to-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@UseGuards(JwtAuthGuard) // <-- SECURE THE ENTIRE CONTROLLER
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@GetUser('id') userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.cartService.getCart(userId);
  }

  @Post('items')
  @UsePipes(new ZodValidationPipe(AddToCartSchema))
  addToCart(
    @GetUser('id') userId: string,
    @Body() addToCartDto: AddToCartDto,
  ): Promise<any> {
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.cartService.addToCart(userId, addToCartDto);
  }

  @Patch('items/:itemId')
  updateCartItem(
    @GetUser('id') userId: string,
    @Param('itemId') itemId: string,
    @Body('quantity') quantity: number,
  ): Promise<any> {
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.cartService.updateCartItem(userId, itemId, quantity);
  }

  @Delete('items/:itemId')
  removeFromCart(
    @GetUser('id') userId: string,
    @Param('itemId') itemId: string,
  ): Promise<any> {
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.cartService.removeFromCart(userId, itemId);
  }

  @Delete()
  clearCart(@GetUser('id') userId: string): Promise<any> {
    if (!userId) {
      throw new BadRequestException('User not authenticated');
    }
    return this.cartService.clearCart(userId);
  }
}
