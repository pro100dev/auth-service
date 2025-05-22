import { Controller, Get, UseGuards, Req, Res, Post, Body, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    this.logger.log('Starting Google OAuth flow');
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    this.logger.log('Received Google OAuth callback');
    this.logger.log('Request user:', req.user);

    try {
      const user = req.user as User;
      this.logger.log('User from request:', { id: user.id, email: user.email });

      const tokens = await this.authService.generateTokens(user);
      this.logger.log('Generated tokens successfully');

      const redirectUrl = `${this.configService.get('FRONTEND_URL')}/oauth-callback?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`;
      this.logger.log('Redirecting to:', redirectUrl);

      res.redirect(redirectUrl);
    } catch (error) {
      this.logger.error('Error in Google OAuth callback:', error);
      const errorUrl = `${this.configService.get('FRONTEND_URL')}/oauth-callback?error=${encodeURIComponent(error.message)}`;
      res.redirect(errorUrl);
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshTokens(@Req() req) {
    const { id, refreshToken } = req.user;
    if (!id || !refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    return this.authService.refreshTokens(id, refreshToken);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    return req.user;
  }
} 