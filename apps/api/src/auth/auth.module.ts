// src/auth/auth.module.ts

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module'; // Import PrismaModule
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    // 1. Import PrismaModule to make PrismaService available.
    // This is the correct way to provide PrismaService to other modules.
    PrismaModule,

    // 2. Configure Passport for authentication strategies.
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // 3. Configure the JWT module to handle token creation and verification.
    JwtModule.registerAsync({
      imports: [ConfigModule], // Make ConfigService available for injection.
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        // It's critical that the secret here is the SAME one used in your JwtStrategy.
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION_TIME', '3600s'), // Default to 1 hour
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    // 4. Register AuthService and JwtStrategy as providers in this module.
    AuthService,
    JwtStrategy, // This is essential for protecting routes later on.
  ],
  exports: [AuthService, JwtModule], // Export AuthService if other modules need to use it.
})
export class AuthModule {}