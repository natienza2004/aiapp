import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from '../items/item.entity';
import { Category } from '../categories/category.entity';
import { Location } from '../locations/location.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  async getSummary(userId: number, role: string) {
    const whereClause = role === 'ADMIN' ? {} : { reporterId: userId };

    const totalItems = await this.itemRepository.count({ where: whereClause });

    const aggregateQuery = this.itemRepository
      .createQueryBuilder('item')
      .select('SUM(item.value * item.quantity)', 'totalValue')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('AVG(item.value)', 'averageValue');

    if (role !== 'ADMIN') {
      aggregateQuery.where('item.reporterId = :userId', { userId });
    }

    const aggregateResult = await aggregateQuery.getRawOne();

    const lowStockQuery = this.itemRepository
      .createQueryBuilder('item')
      .where('item.quantity <= item.lowStockThreshold');

    if (role !== 'ADMIN') {
      lowStockQuery.andWhere('item.reporterId = :userId', { userId });
    }

    const lowStockCount = await lowStockQuery.getCount();

    const highestValueQuery = this.itemRepository
      .createQueryBuilder('item')
      .orderBy('item.value', 'DESC')
      .limit(1);

    if (role !== 'ADMIN') {
      highestValueQuery.where('item.reporterId = :userId', { userId });
    }

    const highestValueItem = await highestValueQuery.getOne();

    const lowestValueQuery = this.itemRepository
      .createQueryBuilder('item')
      .where('item.value > 0')
      .orderBy('item.value', 'ASC')
      .limit(1);

    if (role !== 'ADMIN') {
      lowestValueQuery.andWhere('item.reporterId = :userId', { userId });
    }

    const lowestValueItem = await lowestValueQuery.getOne();

    const totalCategories = await this.categoryRepository.count();
    const totalLocations = await this.locationRepository.count();

    return {
      totalItems,
      totalQuantity: parseInt(aggregateResult?.totalQuantity || '0'),
      totalValue: parseFloat(aggregateResult?.totalValue || '0'),
      averageValue: parseFloat(aggregateResult?.averageValue || '0'),
      totalCategories,
      totalLocations,
      lowStockCount,
      highestValueItem: highestValueItem
        ? { name: highestValueItem.name, value: highestValueItem.value }
        : null,
      lowestValueItem: lowestValueItem
        ? { name: lowestValueItem.name, value: lowestValueItem.value }
        : null,
    };
  }

  async getCategoryReport(userId: number, role: string) {
    const query = this.itemRepository
      .createQueryBuilder('item')
      .select('category.name', 'categoryName')
      .addSelect('COUNT(item.id)', 'itemCount')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.value * item.quantity)', 'totalValue')
      .leftJoin('item.category', 'category')
      .groupBy('category.id')
      .orderBy('itemCount', 'DESC');

    if (role !== 'ADMIN') {
      query.where('item.reporterId = :userId', { userId });
    }

    const result = await query.getRawMany();

    return result.map((r) => ({
      categoryName: r.categoryName || 'Uncategorized',
      itemCount: parseInt(r.itemCount),
      totalQuantity: parseInt(r.totalQuantity || '0'),
      totalValue: parseFloat(r.totalValue || '0'),
    }));
  }

  async getLocationReport(userId: number, role: string) {
    const query = this.itemRepository
      .createQueryBuilder('item')
      .select('location.name', 'locationName')
      .addSelect('COUNT(item.id)', 'itemCount')
      .addSelect('SUM(item.quantity)', 'totalQuantity')
      .addSelect('SUM(item.value * item.quantity)', 'totalValue')
      .leftJoin('item.location', 'location')
      .groupBy('location.id')
      .orderBy('itemCount', 'DESC');

    if (role !== 'ADMIN') {
      query.where('item.reporterId = :userId', { userId });
    }

    const result = await query.getRawMany();

    return result.map((r) => ({
      locationName: r.locationName || 'Unassigned',
      itemCount: parseInt(r.itemCount),
      totalQuantity: parseInt(r.totalQuantity || '0'),
      totalValue: parseFloat(r.totalValue || '0'),
    }));
  }

  async getStockReport(userId: number, role: string) {
    const query = this.itemRepository
      .createQueryBuilder('item')
      .orderBy('item.quantity', 'ASC');

    if (role !== 'ADMIN') {
      query.where('item.reporterId = :userId', { userId });
    }

    const items = await query.getMany();

    return items.map((item) => {
      let status = 'In Stock';
      if (item.quantity === 0) {
        status = 'Out of Stock';
      } else if (item.quantity <= (item.lowStockThreshold || 5)) {
        status = 'Low Stock';
      }

      return {
        name: item.name,
        quantity: item.quantity,
        lowStockThreshold: item.lowStockThreshold || 5,
        status,
      };
    });
  }

  async getRecentActivity(userId: number, role: string) {
    const query = this.itemRepository
      .createQueryBuilder('item')
      .orderBy('item.updatedAt', 'DESC')
      .limit(20);

    if (role !== 'ADMIN') {
      query.where('item.reporterId = :userId', { userId });
    }

    const items = await query.getMany();

    return items.map((item) => {
      const isNew =
        new Date(item.createdAt).getTime() === new Date(item.updatedAt).getTime();
      return {
        name: item.name,
        action: isNew ? 'Added' : 'Updated',
        timestamp: item.updatedAt,
      };
    });
  }

  async exportToCSV(userId: number, role: string): Promise<string> {
    const whereClause = role === 'ADMIN' ? {} : { reporterId: userId };

    const items = await this.itemRepository.find({
      where: whereClause,
      relations: ['category', 'location'],
      order: { createdAt: 'DESC' },
    });

    const headers = ['ID', 'Name', 'Description', 'Category', 'Location', 'Quantity', 'Value', 'Created At'];
    const rows = items.map((item) => [
      item.id,
      item.name,
      item.description || '',
      item.category?.name || 'N/A',
      item.location?.name || 'N/A',
      item.quantity,
      item.value || 0,
      new Date(item.createdAt).toISOString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }
}
