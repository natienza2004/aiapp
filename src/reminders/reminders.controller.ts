import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  findAll() {
    return this.remindersService.findAll();
  }

  @Get('upcoming')
  findUpcoming(@Query('days') days?: string) {
    return this.remindersService.findUpcoming(days ? parseInt(days) : 7);
  }

  @Get('item/:itemId')
  findByItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.remindersService.findByItem(itemId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.remindersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateReminderDto) {
    return this.remindersService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateReminderDto>) {
    return this.remindersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.remindersService.remove(id);
  }
}
