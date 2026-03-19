import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const user = this.usersRepository.create({
      ...createUserDto,
      password: await this.hashPassword(createUserDto.password),
    });
    const saved = await this.usersRepository.save(user);
    return { id: saved.id, name: saved.name, role: saved.role };
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async validateCredentials(email: string, password: string): Promise<Partial<User> | null> {
    const user = await this.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return { id: user.id, name: user.name, role: user.role };
  }

  async listAll(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find({ order: { createdAt: 'DESC' } });
    return users.map((user) => ({ id: user.id, name: user.name, email: user.email, role: user.role }));
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
}
