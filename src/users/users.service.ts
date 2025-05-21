import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    if (!userData.email) {
      throw new Error('Email is required');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const existingUser = await this.findByEmail(userData.email);
      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      const user = this.usersRepository.create(userData);
      const savedUser = await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findByProviderId(providerId: string, provider: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { providerId, provider },
    });
    if (!user)
      throw new NotFoundException(
        `User with provider ${provider} and ID ${providerId} not found`,
      );
    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(User, id, { refreshToken });
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProfile(id: string, userData: Partial<User>): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (userData.email) {
        const existingUser = await this.findByEmail(userData.email);
        if (existingUser && existingUser.id !== id) {
          throw new ConflictException('User with this email already exists');
        }
      }

      await queryRunner.manager.update(User, id, userData);
      const updatedUser = await queryRunner.manager.findOne(User, {
        where: { id },
      });
      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      await queryRunner.commitTransaction();
      return updatedUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
