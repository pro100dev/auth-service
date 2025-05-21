import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config();

// function log_env(){
//   console.log("DEBUG - environment")
//
//   console.log(process.env.DATABASE_HOST);
//   console.log(process.env.DATABASE_PORT);
// }
//
// log_env();

const configService = new ConfigService();

const isProduction = process.env.NODE_ENV === 'production';

export default new DataSource( {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: process.env.DATABASE_PORT,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [process.env.NODE_ENV === 'production' ? 'dist/**/*.entity.js' : 'src/**/*.entity.ts'],
  migrations: [process.env.NODE_ENV === 'production' ? 'dist/migrations/*.js' : 'src/migrations/*.ts'],
  synchronize: false,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  logging: !isProduction,
  extra: {
    connectionTimeoutMillis: 3000,
    max: 20,
    idleTimeoutMillis: 30000,
  },
} as DataSourceOptions);