import { Controller, Get, UseGuards, Req, Res, Post, Body, UnauthorizedException } from '@nestjs/common';
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
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const user = req.user as User;
      const tokens = await this.authService.generateTokens(user);
      const redirectUrl = `${this.configService.get('FRONTEND_URL')}?access_token=${tokens.accessToken}&refresh_token=${tokens.refreshToken}`;
      res.redirect(redirectUrl);
    } catch (error) {
      const errorUrl = `${this.configService.get('FRONTEND_URL')}?error=${encodeURIComponent(error.message)}`;
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