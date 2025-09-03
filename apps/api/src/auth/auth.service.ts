// monorepo-ecom/backend/src/auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { User, Prisma } from '@repo/db';

// Define interface for OAuth user data structure
interface OAuthUser {
  provider: string;
  providerId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  private generateRefreshTokenRaw() {
    return crypto.randomBytes(48).toString('hex');
  }

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private refreshTokenExpiryDays() {
    return Number(this.configService.get<number>('JWT_REFRESH_EXPIRATION_DAYS', 7));
  }

  private async createAndStoreRefreshToken(userId: string) {
    const raw = this.generateRefreshTokenRaw();
    const tokenHash = this.hashToken(raw);
    const days = this.refreshTokenExpiryDays();
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await (this.prisma as any).refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });

    return raw;
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    const saltRounds = Number(this.configService.get<number>('BCRYPT_SALT_ROUNDS', 10));
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);
    const user = await this.prisma.user.create({
      data: {
        email: registerDto.email,
        password: hashedPassword,
        name: registerDto.name ?? null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME', '3600s'),
    });

    const refreshToken = await this.createAndStoreRefreshToken(user.id);

    return {
      user,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user || !user.password || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME', '3600s'),
    });

    const refreshToken = await this.createAndStoreRefreshToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // Rotate refresh token on use: verify provided raw token by hash, ensure not revoked/expired,
  // then create a new refresh token record and revoke the old one atomically.
  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    return await this.prisma.$transaction(async (prisma) => {
      const existing = await (prisma as any).refreshToken.findUnique({ where: { tokenHash } });
      if (!existing) {
        throw new UnauthorizedException('Refresh token not found');
      }
      if (existing.revoked) {
        // possible reuse attack — revoke all refresh tokens for the user
        await (prisma as any).refreshToken.updateMany({ where: { userId: existing.userId }, data: { revoked: true } });
        throw new UnauthorizedException('Refresh token revoked');
      }
      if (existing.expiresAt < new Date()) {
        throw new UnauthorizedException('Refresh token expired');
      }

      // Load user to ensure they still exist
      const user = await prisma.user.findUnique({ where: { id: existing.userId } });
      if (!user) throw new UnauthorizedException('User not found');

      // Create new refresh token
      const newRaw = crypto.randomBytes(48).toString('hex');
      const newHash = this.hashToken(newRaw);
      const days = this.refreshTokenExpiryDays();
      const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

      const newToken = await (prisma as any).refreshToken.create({ data: { tokenHash: newHash, userId: user.id, expiresAt } });

      // Revoke and link old token
      await (prisma as any).refreshToken.update({ where: { id: existing.id }, data: { revoked: true, replacedById: newToken.id } });

      // Issue new access token (stateless JWT)
      const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, role: user.role }, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME', '3600s'),
      });

      return { access_token: accessToken, refresh_token: newRaw };
    });
  }

  // Revoke a refresh token (logout)
  async revokeRefreshToken(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const existing = await (this.prisma as any).refreshToken.findUnique({ where: { tokenHash } });
    if (!existing) return { ok: true };
    await (this.prisma as any).refreshToken.update({ where: { id: existing.id }, data: { revoked: true } });
    return { ok: true };
  }

  // Handle OAuth login/signup
  async validateOAuthUser(oauthUser: OAuthUser) {
    const { provider, providerId, email, firstName, lastName, picture } = oauthUser;

    // Try to find existing user by provider and providerId
    let user: any = await (this.prisma as any).user.findFirst({
      where: {
        provider: provider,
        providerId: providerId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        provider: true,
        providerId: true,
      }
    });

    // If not found by provider, try to find by email (for account linking)
    if (!user && email) {
      user = await (this.prisma as any).user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          password: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          provider: true,
          providerId: true,
        }
      });
    }

    if (user) {
      // Update user info from OAuth provider
      const name = firstName && lastName ? `${firstName} ${lastName}` : user.name;
      
      // Update user with explicitly defined fields
      user = await (this.prisma as any).user.update({
        where: { id: user.id },
        data: {
          name,
          provider,
          providerId,
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          provider: true,
          providerId: true,
        }
      });
    } else {
      // Create new user
      user = await (this.prisma as any).user.create({
        data: {
          email: email || `${providerId}@${provider}.local`, // Fallback for providers without email
          name: firstName && lastName ? `${firstName} ${lastName}` : firstName || `${provider} User`,
          provider,
          providerId,
          password: '', // OAuth users use empty string password instead of null
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          provider: true,
          providerId: true,
        }
      });
    }

    // Generate tokens
    if (!user) {
      throw new InternalServerErrorException('Failed to create or update user');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_TIME', '3600s'),
    });

    const refreshToken = await this.createAndStoreRefreshToken(user.id);

    // Return only the fields we know are present
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        provider: user.provider,
        providerId: user.providerId,
      },
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }
}
