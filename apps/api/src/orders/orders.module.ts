import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

// --- Import modules this module depends on ---

// Provides PrismaService to our OrdersService.
import { PrismaModule } from '../prisma/prisma.module';
// Provides AuthGuard, RolesGuard, and related logic.
import { AuthModule } from '../auth/auth.module';
// Provides information about products (e.g., stock verification).
// Although not explicitly injected in the provided excerpt, it's a common dependency.
import { ProductsModule } from '../products/products.module';

@Module({
  // 'imports' makes the exports of other modules available for injection here.
  imports: [
    PrismaModule, // Now OrdersService can inject PrismaService.
    AuthModule, // Now OrdersController can use AuthGuard and RolesGuard.
    ProductsModule, // Allows OrdersService to potentially use ProductsService methods.
  ],
  // 'controllers' registers our controller to handle incoming HTTP requests.
  controllers: [OrdersController],
  // 'providers' are the services, repositories, etc., instantiated by NestJS
  // and made available for injection within this module.
  providers: [OrdersService],
  // 'exports' makes providers from THIS module available to OTHER modules
  // that import OrdersModule (e.g., for admin dashboards or analytics).
  exports: [OrdersService],
})
export class OrdersModule {}
