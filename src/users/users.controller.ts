import { Body, Controller, Get, HttpCode, Patch, Post, Req, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @HttpCode(201)
  async register(@Body() body: CreateUserDto) {
    return this.usersService.create(body);
  }

  @Post('login')
  async login(@Body() body: LoginUserDto) {
    const user = await this.usersService.validateCredentials(body.email, body.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  @Get('me')
  async getMe(@Req() req: Request) {
    const userId = Number(req.headers['x-user-id']);
    if (!userId) throw new UnauthorizedException();
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  async updateMe(@Req() req: Request, @Body() body: { name?: string; password?: string }) {
    const userId = Number(req.headers['x-user-id']);
    if (!userId) throw new UnauthorizedException();
    return this.usersService.updateProfile(userId, body);
  }

  @Get()
  async list(@Req() req: Request) {
    const role = (req.headers['x-user-role'] as string) || '';
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.usersService.listAll();
  }
}
