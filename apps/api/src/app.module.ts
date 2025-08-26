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

import { AddressesModule } from './addresses/addresses.module';
import { ReviewsModule } from './reviews/reviews.module';
import { DiscountsModule } from './discounts/discounts.module';
import { UsersModule } from './users/users.module';

import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'; 
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { CacheConfigModule } from './cache/cache.module';
import { LoggerModule } from './logger/logger.module';
import { MetricsModule } from './metrics/metrics.module';

// NOTE: I've left out 'analytics' and 'payments' as their folders were empty.
// Add them here once you create their modules.

@Module({
  imports: [
    // --- Configuration and infrastructure modules ---

    ConfigModule.forRoot({ isGlobal: true }),
    CacheConfigModule,
    LoggerModule,
    MetricsModule,
    ThrottlerModule.forRoot([{
      ttl: 60,  
      limit: 5,  
    }]),

    // --- Register all modules here ---
    PrismaModule,
    AuthModule,
    ProductsModule,
    CategoriesModule,
    CartModule,
    OrdersModule,
    UsersModule,
    AddressesModule,
    ReviewsModule,
    DiscountsModule,
    // Make sure AuthGuardModule is imported at the app level
  ],
  controllers: [AppController], // Keep the basic app controller for root health checks
  providers: [    
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },],   // Keep the basic app service
})
export class AppModule {}