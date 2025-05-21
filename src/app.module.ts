import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { LoggerModule } from './logger/logger.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        // Debug: Log all environment variables
        console.log('Environment Variables:', {
          NODE_ENV: process.env.NODE_ENV,
          DATABASE_HOST: configService.get('DATABASE_HOST'),
          DATABASE_PORT: configService.get('DATABASE_PORT'),
          DATABASE_USERNAME: configService.get('DATABASE_USERNAME'),
          DATABASE_PASSWORD: configService.get('DATABASE_PASSWORD'),
          DATABASE_NAME: configService.get('DATABASE_NAME'),
          JWT_SECRET: configService.get('JWT_SECRET'),
          JWT_EXPIRES_IN: configService.get('JWT_EXPIRES_IN'),
          JWT_REFRESH_SECRET: configService.get('JWT_REFRESH_SECRET'),
          JWT_REFRESH_EXPIRES_IN: configService.get('JWT_REFRESH_EXPIRES_IN'),
        });

        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST'),
          port: configService.get('DATABASE_PORT'),
          username: configService.get('DATABASE_USERNAME'),
          password: configService.get('DATABASE_PASSWORD'),
          database: configService.get('DATABASE_NAME'),
          entities: [User],
          synchronize: false,
          logging: process.env.NODE_ENV !== 'production',
          ssl:
            process.env.NODE_ENV === 'production'
              ? {
                  rejectUnauthorized: false,
                }
              : false,
          retryAttempts: 3,
          retryDelay: 3000,
          keepConnectionAlive: true,
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get('THROTTLE_TTL', 60),
          limit: configService.get('THROTTLE_LIMIT', 10),
        },
      ],
      inject: [ConfigService],
    }),
    LoggerModule,
    HealthModule,
    AuthModule,
    UsersModule,
  ],
})
export class AppModule {}
