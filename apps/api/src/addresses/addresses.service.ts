import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Address } from '@repo/db';

@Injectable()
export class AddressesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new address for a specific user.
   * If `isDefault` is true, it transactionally ensures other addresses are not default.
   * @param userId The ID of the user creating the address.
   * @param createAddressDto The address data.
   */
  async create(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    const { isDefault, ...addressData } = createAddressDto;

    if (isDefault) {
      // Use a transaction to ensure atomicity
      return this.prisma.$transaction(async (tx) => {
        // 1. Unset any other default address for this user
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });

        // 2. Create the new default address
        const newAddress = await tx.address.create({
          data: {
            ...addressData,
            isDefault: true,
            userId,
          },
        });
        return newAddress;
      });
    }

    // If not default, just create it
    return this.prisma.address.create({
      data: {
        ...addressData,
        isDefault: false,
        userId,
      },
    });
  }

  /**
   * Finds all addresses belonging to a specific user.
   * @param userId The ID of the user.
   */
  async findAllForUser(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Finds a single address by its ID, ensuring it belongs to the specified user.
   * @param id The ID of the address.
   * @param userId The ID of the user making the request.
   */
  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.prisma.address.findUnique({
      where: { id },
    });

    if (!address) {
      throw new NotFoundException(`Address with ID "${id}" not found.`);
    }

    // CRITICAL: Authorization check. Ensure the user owns this address.
    if (address.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this address.',
      );
    }

    return address;
  }

  /**
   * Updates an address, ensuring the user owns it.
   * Handles the `isDefault` logic transactionally.
   * @param id The ID of the address to update.
   * @param userId The ID of the user making the request.
   * @param updateAddressDto The data to update.
   */
  async update(
    id: string,
    userId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    // First, verify the address exists and the user owns it.
    await this.findOne(id, userId);

    const { isDefault, ...addressData } = updateAddressDto;

    if (isDefault === true) {
      return this.prisma.$transaction(async (tx) => {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
        const updatedAddress = await tx.address.update({
          where: { id },
          data: { ...addressData, isDefault: true },
        });
        return updatedAddress;
      });
    }

    return this.prisma.address.update({
      where: { id },
      data: addressData,
    });
  }

  /**
   * Removes an address, ensuring the user owns it.
   * @param id The ID of the address to delete.
   * @param userId The ID of the user making the request.
   */
  async remove(id: string, userId: string): Promise<Address> {
    // This call handles both the "not found" case and the authorization check.
    await this.findOne(id, userId);

    return this.prisma.address.delete({
      where: { id },
    });
  }
}
