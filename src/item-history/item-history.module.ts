import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemHistoryController, ItemsHistoryController } from './item-history.controller';
import { ItemHistoryService } from './item-history.service';
import { ItemHistory } from './item-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemHistory])],
  controllers: [ItemHistoryController, ItemsHistoryController],
  providers: [ItemHistoryService],
  exports: [ItemHistoryService],
})
export class ItemHistoryModule {}
