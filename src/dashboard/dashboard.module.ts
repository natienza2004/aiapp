import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from '../items/item.entity';
import { Category } from '../categories/category.entity';
import { Location } from '../locations/location.entity';
import { Reminder } from '../reminders/reminder.entity';
import { ItemHistory } from '../item-history/item-history.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Category, Location, Reminder, ItemHistory])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
