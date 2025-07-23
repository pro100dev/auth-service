import { Controller, Get, UseGuards, Req, Res, Post, Body, UnauthorizedException, HttpCode } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { log } from 'console';
import { UsersService } from 'src/users/users.service';
import { readFileSync } from 'fs';
import { join } from 'path';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) { }

  @Get('success')
  getAuthSuccess(@Res() res: Response) {
    const html = readFileSync(join(process.cwd(), 'static/auth-success.html'), 'utf-8');
    res.setHeader('Content-Type', 'text/html');
    res.send(html);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() { }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    try {
      const user = req.user as User;
      const tokens = await this.authService.generateTokens(user);

      res.cookie('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 1000,
      });

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.redirect(`${this.configService.get('FRONTEND_URL')}/?auth_success=true`);
    } catch (error) {
      res.redirect(`${this.configService.get('FRONTEND_URL')}?auth_error=true`);
    }
  }


  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken } = await this.authService.login(loginDto);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { success: true };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  async refreshTokens(@Req() req, @Res({ passthrough: true }) res: Response) {
    const { id, refreshToken } = req.user;
    const cookieRefreshToken = req.cookies['refreshToken'];
    log('Refresh Token:', refreshToken, 'Cookie Refresh Token:', cookieRefreshToken);
    if (!id || !refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (cookieRefreshToken !== refreshToken) {
      throw new UnauthorizedException('Refresh token mismatch');
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshTokens(id, refreshToken);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { success: true };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Req() req) {
    const user = req.user;
    const accessToken = req.cookies['accessToken'];

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
      },
      accessToken,
    };
  }

  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req, @Res({ passthrough: true }) res: Response) {
    const user = req.user;
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    this.usersService.updateRefreshToken(user.id, null, false)
    return { success: true };
  }
} 