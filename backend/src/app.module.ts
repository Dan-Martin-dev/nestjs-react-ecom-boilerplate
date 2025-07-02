// filepath: /home/vare/project/ecom_101/monorepo-ecom/backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// --- Import all your feature modules ---
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';

/* import { AddressesModule } from './addresses/addresses.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DiscountsModule } from './discounts/discounts.module';
import { UsersModule } from './users/users.module';
 */
// NOTE: I've left out 'analytics' and 'payments' as their folders were empty.
// Add them here once you create their modules.

@Module({
  imports: [
    // --- Register all modules here ---
    PrismaModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
/*     UsersModule,
    AddressesModule,
    ReviewsModule,
    DiscountsModule, */
  ],
  controllers: [AppController], // Keep the basic app controller for root health checks
  providers: [AppService],   // Keep the basic app service
})
export class AppModule {}