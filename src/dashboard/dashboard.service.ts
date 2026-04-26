import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../items/item.entity';
import { Category } from '../categories/category.entity';
import { Location } from '../locations/location.entity';
import { Reminder } from '../reminders/reminder.entity';

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
    
    const totalCategories = await this.categoryRepository.count();
    const totalLocations = await this.locationRepository.count();

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
      order: { createdAt: 'DESC' },
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
}
