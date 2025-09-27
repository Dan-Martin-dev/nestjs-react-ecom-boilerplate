// monorepo-ecom/backend/src/auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  UsePipes,
  UseGuards,
  Get,
  Req,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { RegisterDto, RegisterSchema } from './dto/register.dto';
import { LoginDto, LoginSchema } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request as ExpressRequest, Response } from 'express';

// Extend the Express Request interface to include the user property
interface RequestWithUser extends ExpressRequest {
  user: any;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  // Google OAuth routes
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route initiates Google OAuth
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: RequestWithUser, @Res() res: Response) {
    try {
      const result = await this.authService.validateOAuthUser(req.user);
      // Redirect to frontend with tokens
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/auth/callback?token=${result.access_token}&provider=google`,
      );
    } catch (error) {
      console.error('Google OAuth error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/auth/callback?error=auth_failed&provider=google`,
      );
    }
  }

  // Facebook OAuth routes
  @Get('facebook')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuth() {
    // This route initiates Facebook OAuth
  }

  @Get('facebook/callback')
  @UseGuards(AuthGuard('facebook'))
  async facebookAuthCallback(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.validateOAuthUser(req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/auth/callback?token=${result.access_token}&provider=facebook`,
      );
    } catch (error) {
      console.error('Facebook OAuth error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/auth/callback?error=auth_failed&provider=facebook`,
      );
    }
  }

  // Instagram OAuth routes
  @Get('instagram')
  @UseGuards(AuthGuard('instagram'))
  async instagramAuth() {
    // This route initiates Instagram OAuth
  }

  @Get('instagram/callback')
  @UseGuards(AuthGuard('instagram'))
  async instagramAuthCallback(
    @Req() req: RequestWithUser,
    @Res() res: Response,
  ) {
    try {
      const result = await this.authService.validateOAuthUser(req.user);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/auth/callback?token=${result.access_token}&provider=instagram`,
      );
    } catch (error) {
      console.error('Instagram OAuth error:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(
        `${frontendUrl}/auth/callback?error=auth_failed&provider=instagram`,
      );
    }
  }
}
