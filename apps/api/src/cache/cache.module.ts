import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      // Using a regular function since there's no async operations
      useFactory: () => {
        return {
          store: redisStore,
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          ttl: 600, // 10 minutes default TTL
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}
