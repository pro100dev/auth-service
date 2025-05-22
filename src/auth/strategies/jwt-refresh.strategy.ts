import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET')!,
    });
  }

  async validate(payload: any) {
    console.log('JWT Refresh validate payload:', payload);
    const user = await this.usersService.findById(payload.id);
    console.log('JWT Refresh validate user:', user);
    
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (user.version !== payload.version) {
      console.log('Version mismatch:', { 
        tokenVersion: payload.version, 
        userVersion: user.version 
      });
      throw new UnauthorizedException('Token is no longer valid');
    }

    return {
      id: user.id,
      email: user.email,
      refreshToken: user.refreshToken,
      version: user.version
    };
  }
} 