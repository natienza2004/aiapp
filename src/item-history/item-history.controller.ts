import { Controller, Get, Headers, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ItemHistoryService } from './item-history.service';

@Controller('item-history')
export class ItemHistoryController {
  constructor(private readonly historyService: ItemHistoryService) {}

  @Get('recent')
  getRecentActivity(
    @Query('limit') limit?: string,
    @Headers('x-user-id') userId?: string,
    @Headers('x-user-role') role?: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 10;
    const userIdNum = role === 'ADMIN' ? undefined : userId ? parseInt(userId) : undefined;
    return this.historyService.getRecentActivity(limitNum, userIdNum);
  }
}

@Controller('items')
export class ItemsHistoryController {
  constructor(private readonly historyService: ItemHistoryService) {}

  @Get(':id/history')
  getItemHistory(@Param('id', ParseIntPipe) id: number) {
    return this.historyService.getItemHistory(id);
  }
}
