import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
  ParseDatePipe,
  BadRequestException,
} from '@nestjs/common';
import { AuditService, AuditLogResponse, AuditLogQuery } from './audit.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@repo/db';

@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs')
  async getLogs(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 50,
    @Query('userId') userId?: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('fromDate', new ParseDatePipe({ optional: true })) fromDate?: Date,
    @Query('toDate', new ParseDatePipe({ optional: true })) toDate?: Date,
  ): Promise<AuditLogResponse> {
    // Validate page and limit
    if (page < 1) {
      throw new BadRequestException('Page number must be greater than 0');
    }

    if (limit < 1) {
      throw new BadRequestException('Page size must be greater than 0');
    }

    const query: AuditLogQuery = {
      skip: (page - 1) * limit,
      take: limit,
      ...(userId && { userId }),
      ...(entityType && { entityType }),
      ...(entityId && { entityId }),
      ...(action && { action }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
    };

    return this.auditService.findLogs(query);
  }
}
