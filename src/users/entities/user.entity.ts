import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  VersionColumn,
} from 'typeorm';
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsUrl,
} from 'class-validator';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ unique: true })
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password: string;

  @Column()
  @IsString()
  @MinLength(2)
  nickname: string;

  @Column({ nullable: true })
  @IsUrl()
  @IsOptional()
  avatarUrl: string;

  @Column({ type: 'enum', enum: ['google'], default: 'google' })
  @IsString()
  provider: string;

  @Index()
  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  providerId: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @VersionColumn()
  version: number;
}
