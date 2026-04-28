import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../items/item.entity';
import { Category } from '../categories/category.entity';
import { Location } from '../locations/location.entity';
import { Reminder } from '../reminders/reminder.entity';
import { ItemHistory } from '../item-history/item-history.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
    @InjectRepository(ItemHistory)
    private readonly historyRepository: Repository<ItemHistory>,
  ) {}

  async getSummary(userId: number, role: string) {
    const whereClause = role === 'ADMIN' ? {} : { reporterId: userId };
    
    const totalItems = await this.itemRepository.count({ where: whereClause });
    
    const valueQuery = this.itemRepository
      .createQueryBuilder('item')
      .select('SUM(item.value * item.quantity)', 'totalValue')
      .addSelect('SUM(item.quantity)', 'totalQuantity');
    
    if (role !== 'ADMIN') {
      valueQuery.where('item.reporterId = :userId', { userId });
    }
    
    const valueResult = await valueQuery.getRawOne();
    
    // Fix: Count only distinct categories used by active items
    const categoryQuery = this.itemRepository
      .createQueryBuilder('item')
      .select('COUNT(DISTINCT item.categoryId)', 'count')
      .where('item.categoryId IS NOT NULL');
    
    if (role !== 'ADMIN') {
      categoryQuery.andWhere('item.reporterId = :userId', { userId });
    }
    
    const categoryResult = await categoryQuery.getRawOne();
    const totalCategories = parseInt(categoryResult?.count || '0');
    
    // Fix: Count only distinct locations used by active items
    const locationQuery = this.itemRepository
      .createQueryBuilder('item')
      .select('COUNT(DISTINCT item.locationId)', 'count')
      .where('item.locationId IS NOT NULL');
    
    if (role !== 'ADMIN') {
      locationQuery.andWhere('item.reporterId = :userId', { userId });
    }
    
    const locationResult = await locationQuery.getRawOne();
    const totalLocations = parseInt(locationResult?.count || '0');

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const itemsThisMonthQuery = this.itemRepository
      .createQueryBuilder('item')
      .where('item.createdAt >= :startOfMonth', { startOfMonth });
    
    if (role !== 'ADMIN') {
      itemsThisMonthQuery.andWhere('item.reporterId = :userId', { userId });
    }
    
    const itemsThisMonth = await itemsThisMonthQuery.getCount();

    return {
      totalItems,
      totalQuantity: parseInt(valueResult?.totalQuantity || '0'),
      totalValue: parseFloat(valueResult?.totalValue || '0'),
      totalCategories,
      totalLocations,
      itemsThisMonth,
    };
  }

  async getRecentItems(userId: number, role: string, limit: number = 10) {
    const whereClause = role === 'ADMIN' ? {} : { reporterId: userId };
    
    return this.itemRepository.find({
      where: whereClause,
      relations: ['category', 'location', 'reporter'],
      order: { updatedAt: 'DESC', createdAt: 'DESC' },
      take: limit,
    });
  }

  async getCategoryDistribution(userId: number, role: string) {
    const query = this.itemRepository
      .createQueryBuilder('item')
      .select('category.name', 'categoryName')
      .addSelect('COUNT(item.id)', 'itemCount')
      .leftJoin('item.category', 'category')
      .groupBy('category.id')
      .orderBy('itemCount', 'DESC')
      .limit(10);
    
    if (role !== 'ADMIN') {
      query.where('item.reporterId = :userId', { userId });
    }
    
    const result = await query.getRawMany();

    return result.map(r => ({
      category: r.categoryName || 'Uncategorized',
      count: parseInt(r.itemCount),
    }));
  }

  async getLowStockItems(userId: number, role: string) {
    const query = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.location', 'location')
      .where('item.quantity <= item.lowStockThreshold')
      .orderBy('item.quantity', 'ASC');
    
    if (role !== 'ADMIN') {
      query.andWhere('item.reporterId = :userId', { userId });
    }
    
    return query.getMany();
  }

  async getUpcomingReminders(userId: number, role: string, days: number = 7) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    const query = this.reminderRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.item', 'item')
      .where('reminder.expiryDate BETWEEN :today AND :futureDate', { today, futureDate })
      .andWhere('reminder.isCompleted = :isCompleted', { isCompleted: false })
      .orderBy('reminder.expiryDate', 'ASC');
    
    if (role !== 'ADMIN') {
      query.andWhere('item.reporterId = :userId', { userId });
    }
    
    return query.getMany();
  }

  async getValueByCategory(userId: number, role: string) {
    const query = this.itemRepository
      .createQueryBuilder('item')
      .select('category.name', 'categoryName')
      .addSelect('SUM(item.value * item.quantity)', 'totalValue')
      .leftJoin('item.category', 'category')
      .groupBy('category.id')
      .orderBy('totalValue', 'DESC')
      .limit(10);
    
    if (role !== 'ADMIN') {
      query.where('item.reporterId = :userId', { userId });
    }
    
    const result = await query.getRawMany();

    return result.map(r => ({
      category: r.categoryName || 'Uncategorized',
      value: parseFloat(r.totalValue || '0'),
    }));
  }

  async getRecentActivity(userId: number, role: string, limit: number = 10) {
    const query = this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.item', 'item')
      .leftJoinAndSelect('history.user', 'user')
      .orderBy('history.createdAt', 'DESC')
      .limit(limit);
    
    if (role !== 'ADMIN') {
      query.where('history.userId = :userId', { userId });
    }
    
    return query.getMany();
  }

  async getDebugCounts(userId: number, role: string) {
    const totalLocationRecords = await this.locationRepository.count();
    
    const usedLocationQuery = this.itemRepository
      .createQueryBuilder('item')
      .select('COUNT(DISTINCT item.locationId)', 'count')
      .where('item.locationId IS NOT NULL');
    
    if (role !== 'ADMIN') {
      usedLocationQuery.andWhere('item.reporterId = :userId', { userId });
    }
    
    const usedLocationResult = await usedLocationQuery.getRawOne();
    const usedLocationCount = parseInt(usedLocationResult?.count || '0');
    
    const itemsWithoutLocationQuery = this.itemRepository
      .createQueryBuilder('item')
      .where('item.locationId IS NULL');
    
    if (role !== 'ADMIN') {
      itemsWithoutLocationQuery.andWhere('item.reporterId = :userId', { userId });
    }
    
    const itemsWithoutLocation = await itemsWithoutLocationQuery.getCount();
    
    const distinctLocationsQuery = this.itemRepository
      .createQueryBuilder('item')
      .leftJoin('item.location', 'location')
      .select('DISTINCT location.name', 'name')
      .where('item.locationId IS NOT NULL');
    
    if (role !== 'ADMIN') {
      distinctLocationsQuery.andWhere('item.reporterId = :userId', { userId });
    }
    
    const distinctLocations = await distinctLocationsQuery.getRawMany();
    
    return {
      totalLocationRecords,
      usedLocationCount,
      unusedLocationCount: totalLocationRecords - usedLocationCount,
      itemsWithoutLocation,
      distinctUsedLocations: distinctLocations.map(l => l.name).filter(Boolean),
    };
  }
}
