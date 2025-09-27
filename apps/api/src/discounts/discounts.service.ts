import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  /**
   * (ADMIN) Creates a new discount and connects it to products/categories.
   */
  async create(createDiscountDto: CreateDiscountDto): Promise<any> {
    const { applicableProductIds, applicableCategoryIds, ...discountData } =
      createDiscountDto;

    return this.prisma.discount.create({
      data: {
        ...discountData,
        applicableProducts: {
          connect: applicableProductIds?.map((id) => ({ id })),
        },
        applicableCategories: {
          connect: applicableCategoryIds?.map((id) => ({ id })),
        },
      },
    });
  }

  /**
   * (ADMIN) Finds all discounts.
   */
  async findAll(): Promise<any> {
    return this.prisma.discount.findMany({
      include: {
        applicableProducts: { select: { id: true, name: true } },
        applicableCategories: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * (PUBLIC) Finds a single discount by its code and validates its usability.
   * This is for customers applying a code to their cart.
   */
  async validateDiscountCode(code: string): Promise<any> {
    const discount = await this.prisma.discount.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!discount) {
      throw new NotFoundException('Discount code not found.');
    }
    if (!discount.isActive) {
      throw new BadRequestException('This discount code is not active.');
    }
    if (discount.startDate && new Date() < discount.startDate) {
      throw new BadRequestException('This discount is not yet active.');
    }
    if (discount.endDate && new Date() > discount.endDate) {
      throw new BadRequestException('This discount code has expired.');
    }
    if (
      discount.usageLimit !== null &&
      discount.timesUsed >= discount.usageLimit
    ) {
      throw new BadRequestException(
        'This discount code has reached its usage limit.',
      );
    }

    // Return the valid discount object, excluding sensitive usage counts
    const { timesUsed, ...validatedDiscount } = discount;
    return validatedDiscount;
  }

  /**
   * (ADMIN) Finds a single discount by its ID for management purposes.
   */
  async findOne(id: string): Promise<any> {
    const discount = await this.prisma.discount.findUnique({
      where: { id },
      include: {
        applicableProducts: true,
        applicableCategories: true,
      },
    });

    if (!discount) {
      throw new NotFoundException(`Discount with ID "${id}" not found.`);
    }
    return discount;
  }

  /**
   * (ADMIN) Updates a discount. `set` is used to replace existing relations.
   */
  async update(id: string, updateDiscountDto: UpdateDiscountDto): Promise<any> {
    const { applicableProductIds, applicableCategoryIds, ...discountData } =
      updateDiscountDto;

    await this.findOne(id); // Ensure discount exists

    return this.prisma.discount.update({
      where: { id },
      data: {
        ...discountData,
        applicableProducts: applicableProductIds
          ? { set: applicableProductIds.map((id) => ({ id })) }
          : undefined,
        applicableCategories: applicableCategoryIds
          ? { set: applicableCategoryIds.map((id) => ({ id })) }
          : undefined,
      },
    });
  }

  /**
   * (ADMIN) Deletes a discount.
   */
  async remove(id: string): Promise<any> {
    await this.findOne(id); // Ensure discount exists
    return this.prisma.discount.delete({ where: { id } });
  }
}
