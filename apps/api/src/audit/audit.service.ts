import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, AuditLog, User } from '@repo/db';

export interface CreateAuditLogDto {
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogWithUser extends AuditLog {
  user: Pick<User, 'id' | 'email' | 'name'>;
}

export interface AuditLogQuery {
  skip?: number;
  take?: number;
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface AuditLogResponse {
  logs: AuditLogWithUser[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable()
export class AuditService {
  private readonly MAX_PAGE_SIZE = 100;
  private readonly DEFAULT_PAGE_SIZE = 50;
  private readonly userSelect = {
    id: true,
    email: true,
    name: true,
  } as const;

  constructor(private readonly prisma: PrismaService) {}

  async log(dto: CreateAuditLogDto): Promise<AuditLogWithUser> {
    if (!dto.userId) {
      throw new BadRequestException('User ID is required');
    }

    try {
      const created = await this.prisma.auditLog.create({
        data: {
          action: dto.action,
          entityType: dto.entityType,
          entityId: dto.entityId,
          details: (dto.details as Prisma.InputJsonValue) ?? undefined,
          ipAddress: dto.ipAddress,
          userAgent: dto.userAgent,
          user: { connect: { id: dto.userId } },
        },
        include: {
          user: {
            select: this.userSelect,
          },
        },
      });
      return created;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Invalid user ID provided');
        }
      }
      throw new BadRequestException('Failed to create audit log');
    }
  }

  async findLogs(query: AuditLogQuery): Promise<AuditLogResponse> {
    try {
      // Validate and prepare pagination
      const skip = Math.max(0, query.skip ?? 0);
      const take = Math.min(
        Math.max(1, query.take ?? this.DEFAULT_PAGE_SIZE),
        this.MAX_PAGE_SIZE,
      );

      // Validate date range
      if (query.fromDate && query.toDate && query.fromDate > query.toDate) {
        throw new BadRequestException(
          'fromDate must be before or equal to toDate',
        );
      }

      // Build where clause
      const where: Prisma.AuditLogWhereInput = {
        ...(query.userId && { userId: query.userId }),
        ...(query.entityType && { entityType: query.entityType }),
        ...(query.entityId && { entityId: query.entityId }),
        ...(query.action && { action: query.action }),
        ...(query.fromDate || query.toDate
          ? {
              timestamp: {
                ...(query.fromDate && { gte: query.fromDate }),
                ...(query.toDate && { lte: query.toDate }),
              },
            }
          : {}),
      };

      const [logs, total] = await this.prisma.$transaction([
        this.prisma.auditLog.findMany({
          skip,
          take,
          where,
          orderBy: { timestamp: 'desc' } as const,
          include: {
            user: {
              select: this.userSelect,
            },
          },
        }),
        this.prisma.auditLog.count({ where }),
      ]);

      return {
        logs: logs as AuditLogWithUser[],
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch audit logs');
    }
  }
}
