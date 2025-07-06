import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], // Import the main app module to build a test app
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = app.get<PrismaService>(PrismaService);
    
    await app.init();

    // It's critical to clean the database before running tests
    // to prevent contamination from previous runs.
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    await prisma.user.deleteMany({});
    await app.close();
  });

  // Clean the user table before each individual test to ensure isolation
  beforeEach(async () => {
    await prisma.user.deleteMany({});
  });

  describe('/auth/register (POST)', () => {
    const registerDto = {
      name: 'E2E Test User',
      email: 'e2e@test.com',
      password: 'password123',
    };

    it('should register a new user and return user data with an access token', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201)
        .then((res) => {
          // Check for the token
          expect(res.body).toHaveProperty('access_token');
          
          // Check the user object structure and values
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toEqual(registerDto.email);
          expect(res.body.user.name).toEqual(registerDto.name);
          expect(res.body.user.role).toEqual('CUSTOMER'); // Verify default role
          expect(res.body.user).not.toHaveProperty('password'); // Ensure password is not returned
        });
    });

    it('should fail with 400 Bad Request if email is invalid', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerDto, email: 'invalid-email' })
        .expect(400); // ZodValidationPipe should catch this
    });

    it('should fail with 400 Bad Request if password is too short', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({ ...registerDto, password: '123' }) // Password is less than 8 chars
        .expect(400); // ZodValidationPipe should catch this
    });

    it('should fail with 409 Conflict if user with the same email already exists', async () => {
      // First, register the user successfully
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(201);
      
      // Then, attempt to register again with the same email
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(registerDto)
        .expect(409)
        .then((res) => {
          expect(res.body.message).toEqual('User already exists');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    const loginDto = {
      email: 'login.e2e@test.com',
      password: 'strongPassword123',
    };

    // Before running login tests, create a user to log in with
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      await prisma.user.create({
        data: {
          name: 'Login User',
          email: loginDto.email,
          password: hashedPassword,
          role: 'CUSTOMER', // Explicitly set role
        },
      });
    });

    it('should log in the user and return user data with an access token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(200) // Login returns 200 OK
        .then((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(res.body.user).toBeDefined();
          expect(res.body.user.email).toEqual(loginDto.email);
          expect(res.body.user).not.toHaveProperty('password');
        });
    });

    it('should fail with 401 Unauthorized if password is incorrect', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...loginDto, password: 'wrongpassword' })
        .expect(401)
        .then((res) => {
          expect(res.body.message).toEqual('Invalid credentials');
        });
    });

    it('should fail with 401 Unauthorized if user does not exist', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ ...loginDto, email: 'notfound@test.com' })
        .expect(401);
    });
  });
});