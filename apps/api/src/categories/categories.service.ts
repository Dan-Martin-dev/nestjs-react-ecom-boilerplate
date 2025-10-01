import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { parentId, ...categoryData } = createCategoryDto;

    // Verify parent category exists if provided
    if (parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: parentId, deletedAt: null },
      });

      if (!parentCategory) {
        throw new BadRequestException('Parent category not found');
      }
    }

    return this.prisma.category.create({
      data: {
        ...categoryData,
        parentId,
      },
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
        },
        _count: {
          select: {
            Product: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getCategoryTree() {
    const categories = await this.prisma.category.findMany({
      where: {
        deletedAt: null,
        parentId: null, // Root categories only
      },
      include: {
        children: {
          where: { deletedAt: null },
          include: {
            children: {
              where: { deletedAt: null },
              include: {
                _count: {
                  select: {
                    Product: true,
                  },
                },
              },
            },
            _count: {
              select: {
                Product: true,
              },
            },
          },
        },
        _count: {
          select: {
            Product: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return categories;
  }

  async findOne(id: string): Promise<any> {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
        },
        Product: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          include: {
            images: {
              where: { isDefault: true },
              take: 1,
            },
            variants: {
              take: 1,
              orderBy: {
                price: 'asc',
              },
            },
          },
          take: 12,
        },
        _count: {
          select: {
            Product: {
              where: {
                isActive: true,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug, deletedAt: null },
      include: {
        parent: true,
        children: {
          where: { deletedAt: null },
        },
        _count: {
          select: {
            Product: {
              where: {
                isActive: true,
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        parent: true,
        children: true,
      },
    });
  }

  async remove(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id, deletedAt: null },
      include: {
        children: {
          where: { deletedAt: null },
        },
        Product: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children.length > 0) {
      throw new BadRequestException(
        'Cannot delete category with subcategories',
      );
    }

    if (category.Product.length > 0) {
      throw new BadRequestException('Cannot delete category with products');
    }

    // Soft delete
    return this.prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
