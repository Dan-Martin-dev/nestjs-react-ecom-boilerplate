import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { productId, rating, comment } = createReviewDto;

    // Check if product exists and is active
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Check if user has purchased this product (status DELIVERED)
    // This is a common business rule for reviews
    const hasPurchased = await this.prisma.orderItem.findFirst({
      where: {
        productVariant: {
          productId, // Check if any variant of the product was purchased
        },
        order: {
          userId,
          status: 'DELIVERED', // Only allow reviews for delivered orders
        },
      },
    });

    if (!hasPurchased) {
      throw new BadRequestException(
        'You can only review products you have purchased',
      );
    }

    // Check if user already reviewed this product
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_productId: {
          // Unique constraint in schema.prisma
          userId,
          productId,
        },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this product');
    }

    // Create the review
    return this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
      },
      include: {
        user: {
          // Include user info in the response
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findProductReviews(productId: string, paginationDto: PaginationDto) {
    // FIX: Added default values for page (1) and limit (10).
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationDto;
    const skip = (page - 1) * limit;

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: productId, isActive: true, deletedAt: null },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Fetch reviews, total count, and average rating concurrently
    const [reviews, total, averageRating] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            // Include user info
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where: { productId } }),
      this.prisma.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      }),
    ]);

    // Get rating distribution (count of reviews for each rating 1-5)
    const ratingDistribution = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { productId },
      _count: { rating: true },
      orderBy: { rating: 'desc' },
    });

    // Format the response
    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        // This calculation is now safe because 'limit' has a default value.
        totalPages: Math.ceil(total / limit),
        averageRating: averageRating._avg.rating || 0, // Default to 0 if no reviews
        totalReviews: averageRating._count.rating,
        ratingDistribution: ratingDistribution.reduce(
          (acc, item) => {
            acc[item.rating] = item._count.rating;
            return acc;
          },
          {} as Record<number, number>,
        ), // Map rating to count
      },
    };
  }

  async findUserReviews(userId: string, paginationDto: PaginationDto) {
    // FIX: Added default values for page (1) and limit (10).
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationDto;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product: {
            // Include product info
            select: {
              id: true,
              name: true,
              slug: true,
              images: {
                // Include default image
                where: { isDefault: true },
                take: 1,
              },
            },
          },
        },
      }),
      this.prisma.review.count({ where: { userId } }),
    ]);

    return {
      data: reviews,
      meta: {
        total,
        page,
        limit,
        // This calculation is now safe because 'limit' has a default value.
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(userId: string, reviewId: string, updateReviewDto: any) {
    // Consider a specific UpdateReviewDto
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Ensure the user is the owner of the review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update the review
    return this.prisma.review.update({
      where: { id: reviewId },
      data: updateReviewDto,
      include: {
        user: {
          // Include user info in the response
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async remove(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Ensure the user is the owner of the review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Delete the review
    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    return { message: 'Review deleted successfully' };
  }
}
