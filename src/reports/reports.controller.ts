import { Controller, Get, Headers, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('summary')
  getSummary(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.reportsService.getSummary(parseInt(userId), role);
  }

  @Get('category')
  getCategoryReport(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.reportsService.getCategoryReport(parseInt(userId), role);
  }

  @Get('location')
  getLocationReport(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.reportsService.getLocationReport(parseInt(userId), role);
  }

  @Get('stock')
  getStockReport(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.reportsService.getStockReport(parseInt(userId), role);
  }

  @Get('recent-activity')
  getRecentActivity(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.reportsService.getRecentActivity(parseInt(userId), role);
  }

  @Get('insights')
  getInsights(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.reportsService.getInsights(parseInt(userId), role);
  }

  @Get('data-quality')
  getDataQuality(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.reportsService.getDataQuality(parseInt(userId), role);
  }

  @Get('export')
  async exportReport(
    @Query('format') format: string,
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
    @Res() res: Response,
  ) {
    const csv = await this.reportsService.exportToCSV(parseInt(userId), role);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory-report.csv');
    res.send(csv);
  }
}
