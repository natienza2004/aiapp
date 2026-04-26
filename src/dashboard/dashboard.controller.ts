import { Controller, Get, Headers, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Headers('x-user-id') userId: string, @Headers('x-user-role') role: string) {
    return this.dashboardService.getSummary(parseInt(userId), role);
  }

  @Get('recent-items')
  getRecentItems(@Headers('x-user-id') userId: string, @Headers('x-user-role') role: string, @Query('limit') limit?: string) {
    return this.dashboardService.getRecentItems(parseInt(userId), role, limit ? parseInt(limit) : 10);
  }

  @Get('category-distribution')
  getCategoryDistribution(@Headers('x-user-id') userId: string, @Headers('x-user-role') role: string) {
    return this.dashboardService.getCategoryDistribution(parseInt(userId), role);
  }

  @Get('low-stock')
  getLowStockItems(@Headers('x-user-id') userId: string, @Headers('x-user-role') role: string) {
    return this.dashboardService.getLowStockItems(parseInt(userId), role);
  }

  @Get('upcoming-reminders')
  getUpcomingReminders(@Headers('x-user-id') userId: string, @Headers('x-user-role') role: string, @Query('days') days?: string) {
    return this.dashboardService.getUpcomingReminders(parseInt(userId), role, days ? parseInt(days) : 7);
  }

  @Get('value-by-category')
  getValueByCategory(@Headers('x-user-id') userId: string, @Headers('x-user-role') role: string) {
    return this.dashboardService.getValueByCategory(parseInt(userId), role);
  }
}
