import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@repo/db';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error: unknown) {
      // In development mode, continue even if database connection fails
      const typedError = error as Error;
      this.logger.warn(
        `Database connection failed: ${typedError.message || 'Unknown error'}`,
      );
      this.logger.warn(
        'Continuing without database connection in development mode',
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
