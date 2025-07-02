import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';

// --- Import modules this module depends on ---

// Provides PrismaService to our CategoriesService.
import { PrismaModule } from '../prisma/prisma.module';
// Provides AuthGuard, RolesGuard, and related logic used in the controller.
import { AuthModule } from '../auth/auth.module';

@Module({
  // 'imports' makes the exports of other modules available for injection here.
  // We need PrismaModule for database interactions in the service.
  // We need AuthModule for authentication and authorization guards in the controller.
  imports: [PrismaModule, AuthModule],

  // 'controllers' registers our controller to handle incoming HTTP requests for this module's routes.
  controllers: [CategoriesController],

  // 'providers' are the services, repositories, etc., instantiated by NestJS
  // and made available for injection within this module.
  providers: [CategoriesService],

  // 'exports' makes providers from THIS module available to OTHER modules
  // that import CategoriesModule (e.g., ProductsModule might need CategoriesService).
  exports: [CategoriesService],
})
export class CategoriesModule {}