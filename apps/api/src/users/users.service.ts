// monorepo-ecom/backend/src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

// Define the shape of the user object we want to return from our service.
// This is a critical security measure to ensure the password hash is never exposed.
export const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Finds all users.
   * NOTE: In a production app, this should be paginated.
   * This is an ADMIN-only operation.
   */
  async findAll() {
    return this.prisma.user.findMany({
      select: userSelect,
    });
  }

  /**
   * Finds a single user by their ID. Throws an error if not found.
   * @param id The user's unique identifier.
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  /**
   * Updates a user's data.
   * @param id The user's unique identifier.
   * @param updateUserDto The data to update.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // The findOne call ensures the user exists before attempting to update
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
      select: userSelect,
    });
  }

  /**
   * Deletes a user.
   * NOTE: Consider if soft-delete is more appropriate for your e-commerce app.
   * @param id The user's unique identifier.
   */
  async remove(id: string) {
    // The findOne call ensures the user exists before attempting to delete
    await this.findOne(id);

    // This will cascade delete related data as defined in your schema.prisma
    return this.prisma.user.delete({
      where: { id },
      select: userSelect,
    });
  }
}
