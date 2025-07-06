import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule], // Make PrismaService available for injection into UsersService
  controllers: [UsersController],
  providers: [UsersService],
  // Export UsersService so other modules (e.g., AuthModule, OrdersModule) can use it.
  exports: [UsersService],
})
export class UsersModule {}