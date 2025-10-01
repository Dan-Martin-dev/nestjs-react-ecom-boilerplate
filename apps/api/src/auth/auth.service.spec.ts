import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@repo/db'; // Correctly import the Role enum

// Mocking the bcrypt library
jest.mock('bcrypt');
const bcryptHash = bcrypt.hash as jest.Mock;
const bcryptCompare = bcrypt.compare as jest.Mock;

describe('AuthService', () => {
  let service: AuthService;

  // Mock providers that mimic the real services
  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };
  const mockJwtService = {
    signAsync: jest.fn(),
  };
  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset mocks before each test to ensure test isolation
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };
    const createdUser = {
      id: 'clxoi8x5c000008l3g1h3b2k9', // Example CUID
      email: 'test@example.com',
      name: 'Test User',
      role: Role.CUSTOMER, // Using the correct enum from your schema
      createdAt: new Date(),
    };

    it('should register a new user, hash password, and return user and token', async () => {
      // Arrange: Set up the mocks to return expected values
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue(10);
      bcryptHash.mockResolvedValue('hashedPassword');
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockJwtService.signAsync.mockResolvedValue('mockAccessToken');

      // Act: Call the method being tested
      const result = await service.register(registerDto);

      // Assert: Verify that the mocks were called correctly and the result is as expected
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(mockConfigService.get).toHaveBeenCalledWith('BCRYPT_SALT_ROUNDS');
      expect(bcryptHash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...registerDto,
          password: 'hashedPassword',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      });
      expect(result).toEqual({
        user: createdUser,
        access_token: 'mockAccessToken',
      });
    });

    it('should throw ConflictException if user already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(createdUser);
      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException if salt rounds are not configured', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockConfigService.get.mockReturnValue(undefined);
      await expect(service.register(registerDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };
    const userInDb = {
      id: 'clxoi8x5c000008l3g1h3b2k9',
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashedPassword',
      role: Role.CUSTOMER, // Using the correct enum from your schema
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should log in a user and return user data and a token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userInDb);
      bcryptCompare.mockResolvedValue(true);
      mockJwtService.signAsync.mockResolvedValue('mockAccessToken');

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcryptCompare).toHaveBeenCalledWith(
        loginDto.password,
        userInDb.password,
      );
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({
        sub: userInDb.id,
        email: userInDb.email,
        role: userInDb.role,
      });
      expect(result).toEqual({
        user: {
          id: userInDb.id,
          email: userInDb.email,
          name: userInDb.name,
          role: userInDb.role,
        },
        access_token: 'mockAccessToken',
      });
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(userInDb);
      bcryptCompare.mockResolvedValue(false);
      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
