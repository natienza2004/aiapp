import { Body, Controller, Get, Header, HttpCode, Post, Req, UnauthorizedException } from '@nestjs/common';
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

  @Get()
  async list(@Req() req: Request) {
    const role = (req.headers['x-user-role'] as string) || '';
    if (role !== 'ADMIN') {
      throw new UnauthorizedException('Admin access required');
    }
    return this.usersService.listAll();
  }
}
