import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

// --- Import modules this module depends on ---

// Provides PrismaService to our CartService
import { PrismaModule } from '../prisma/prisma.module';
// Provides JwtAuthGuard and related user/auth logic
import { AuthModule } from '../auth/auth.module';
// Provides information about products (e.g., stock, price)
import { ProductsModule } from 'src/products/products.module';

@Module({
  // 'imports' makes the exports of other modules available for injection here.
  imports: [
    PrismaModule, // Now CartService can inject PrismaService.
    AuthModule, // Now CartController can use JwtAuthGuard.
    ProductsModule, // A best practice so CartService can rely on ProductService.
  ],
  // 'controllers' registers our controller to handle incoming requests.
  controllers: [CartController],
  // 'providers' are the services, repositories, etc., instantiated by NestJS
  // and made available for injection within this module.
  providers: [CartService],
  // 'exports' makes providers from THIS module available to OTHER modules
  // that import CartModule.
  exports: [CartService],
})
export class CartModule {}
