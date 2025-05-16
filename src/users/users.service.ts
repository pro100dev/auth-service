import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
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
    if (!user) throw new NotFoundException(`User with provider ${provider} and ID ${providerId} not found`);
    return user;
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await this.usersRepository.update(id, { refreshToken });
  }

  async updateProfile(id: string, userData: Partial<User>): Promise<User> {
    await this.usersRepository.update(id, userData);
    return this.findById(id);
  }
} 