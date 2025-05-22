import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateOAuthLogin(profile: any, provider: string): Promise<User> {
    try {
      const user = await this.usersService.findByProviderId(profile.id, provider);
      
      if (user) {
        return user;
      }

      return await this.usersService.create({
        email: profile.email,
        nickname: profile.displayName || profile.username,
        avatarUrl: profile.photos?.[0]?.value,
        provider,
        providerId: profile.id,
      });
    } catch (err) {
      throw err;
    }
  }

  async register(registerDto: RegisterDto): Promise<{ accessToken: string; refreshToken: string }> {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    
    const user = await this.usersService.create({
      email: registerDto.email,
      password: hashedPassword,
      nickname: registerDto.nickname,
      provider: 'google', // Using 'google' as default for now
    });

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async generateTokens(user: User) {
    console.log('Generating tokens for user:', { id: user.id, version: user.version });
    
    // First update refresh token to increment version
    const tempRefreshToken = 'temp_' + Date.now();
    await this.usersService.updateRefreshToken(user.id, tempRefreshToken, true);
    
    // Get updated user with new version
    const updatedUser = await this.usersService.findById(user.id);
    console.log('User updated:', { id: updatedUser.id, version: updatedUser.version });
    
    // Generate both tokens with new version
    const payload = { 
      id: updatedUser.id, 
      email: updatedUser.email,
      version: updatedUser.version 
    };
    console.log('Generating tokens with payload:', payload);
    
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        payload,
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        }
      ),
      this.jwtService.signAsync(
        payload,
        {
          secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
        }
      )
    ]);

    // Update refresh token without incrementing version
    await this.usersService.updateRefreshToken(updatedUser.id, refreshToken, false);
    
    // Verify the tokens were generated correctly
    const decodedAccessToken = this.jwtService.decode(accessToken);
    console.log('Generated access token payload:', decodedAccessToken);

    console.log('Tokens generated with version:', { version: updatedUser.version });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: string, refreshToken: string) {
    console.log('Refreshing tokens for user:', userId);
    const user = await this.usersService.findById(userId);
    console.log('User found:', { id: user.id, version: user.version });
    
    if (!user || user.refreshToken !== refreshToken) {
      console.log('Invalid refresh token:', { 
        providedToken: refreshToken, 
        storedToken: user?.refreshToken 
      });
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    return this.generateTokens(user);
  }
} 