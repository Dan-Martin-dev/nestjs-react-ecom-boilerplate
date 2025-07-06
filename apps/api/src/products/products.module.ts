import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

// --- Import modules this module depends on ---

// Provides PrismaService to our ProductsService.
import { PrismaModule } from '../prisma/prisma.module';
// Provides AuthGuard, RolesGuard, and related logic.
import { AuthModule } from '../auth/auth.module';

@Module({
  // 'imports' makes the exports of other modules available for injection here.
  // We need AuthModule for the guards used in the controller.
  // We need PrismaModule for the database service used in the service.
  imports: [PrismaModule, AuthModule],
  
  // 'controllers' registers our controller to handle incoming HTTP requests.
  controllers: [ProductsController],
  
  // 'providers' registers the service with the NestJS DI container.
  providers: [ProductsService],
  
  // 'exports' makes ProductsService available to any other module that imports
  // the ProductModule (e.g., the CartModule).
  exports: [ProductsService],
})
export class ProductsModule {}