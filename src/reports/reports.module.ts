import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Item } from '../items/item.entity';
import { Category } from '../categories/category.entity';
import { Location } from '../locations/location.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Item, Category, Location])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
