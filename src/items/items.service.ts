import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Category } from '../categories/category.entity';
import { Location } from '../locations/location.entity';
import { ItemHistoryService } from '../item-history/item-history.service';

export type ItemSortBy =
  | 'name'
  | 'quantity'
  | 'value'
  | 'createdAt'
  | 'updatedAt'
  | 'category'
  | 'location';

export interface ItemSortOptions {
  sortBy?: string;
  sortOrder?: string;
}

const SORT_COLUMNS: Record<ItemSortBy, string> = {
  name: 'item.name',
  quantity: 'item.quantity',
  value: 'item.value',
  createdAt: 'item.createdAt',
  updatedAt: 'item.updatedAt',
  category: 'category.name',
  location: 'location.name',
};

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    private readonly historyService: ItemHistoryService,
  ) {}

  private async getOrCreateCategoryId(categoryName: string): Promise<number | undefined> {
    const name = categoryName.trim();
    if (!name) return undefined;

    let categoryEntity = await this.categoryRepository.findOne({ where: { name } });
    if (!categoryEntity) {
      categoryEntity = await this.categoryRepository.save({ name });
    }

    return categoryEntity.id;
  }

  private async getOrCreateLocationId(locationName: string): Promise<number | undefined> {
    const name = locationName.trim();
    if (!name) return undefined;

    let locationEntity = await this.locationRepository.findOne({ where: { name } });
    if (!locationEntity) {
      locationEntity = await this.locationRepository.save({ name });
    }

    return locationEntity.id;
  }

  private getSort(sortOptions?: ItemSortOptions): { column: string; direction: 'ASC' | 'DESC' } | null {
    const sortBy = sortOptions?.sortBy as ItemSortBy | undefined;
    if (!sortBy || !SORT_COLUMNS[sortBy]) return null;

    return {
      column: SORT_COLUMNS[sortBy],
      direction: sortOptions?.sortOrder?.toLowerCase() === 'desc' ? 'DESC' : 'ASC',
    };
  }

  private applySort(queryBuilder: ReturnType<Repository<Item>['createQueryBuilder']>, sortOptions?: ItemSortOptions) {
    const sort = this.getSort(sortOptions);
    if (!sort) {
      return queryBuilder.orderBy('item.createdAt', 'DESC');
    }

    return queryBuilder
      .orderBy(`${sort.column} IS NULL`, 'ASC')
      .addOrderBy(sort.column, sort.direction);
  }

  findAll(sortOptions?: ItemSortOptions): Promise<Item[]> {
    if (!this.getSort(sortOptions)) {
      return this.itemRepository.find({ 
        relations: ['reporter', 'category', 'location'], 
        order: { createdAt: 'DESC' } 
      });
    }

    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.reporter', 'reporter')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.location', 'location');

    return this.applySort(queryBuilder, sortOptions).getMany();
  }

  findAllForUser(userId: number, sortOptions?: ItemSortOptions): Promise<Item[]> {
    if (!this.getSort(sortOptions)) {
      return this.itemRepository.find({
        relations: ['reporter', 'category', 'location'],
        where: { reporterId: userId },
        order: { createdAt: 'DESC' },
      });
    }

    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.reporter', 'reporter')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.location', 'location')
      .where('item.reporterId = :userId', { userId });

    return this.applySort(queryBuilder, sortOptions).getMany();
  }

  async findOne(id: number): Promise<Item> {
    const item = await this.itemRepository.findOne({ 
      where: { id }, 
      relations: ['reporter', 'category', 'location'] 
    });
    if (!item) {
      throw new NotFoundException(`Item with id ${id} not found`);
    }
    return item;
  }

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const itemData: any = { ...createItemDto };
    
    // Handle string category - find or create
    if (createItemDto.category && typeof createItemDto.category === 'string') {
      itemData.categoryId = await this.getOrCreateCategoryId(createItemDto.category);
      delete itemData.category;
    }
    
    // Handle string location - find or create
    if (createItemDto.location && typeof createItemDto.location === 'string') {
      itemData.locationId = await this.getOrCreateLocationId(createItemDto.location);
      delete itemData.location;
    }
    
    const item = this.itemRepository.create(itemData) as unknown as Item;
    const savedItem = await this.itemRepository.save(item) as unknown as Item;
    
    // Log creation
    if (savedItem.reporterId) {
      try {
        await this.historyService.logItemCreated(savedItem.id, savedItem.reporterId);
      } catch (err) {
        console.error('Failed to log item creation:', err);
      }
    }
    
    // Return with relations
    return this.findOne(savedItem.id);
  }

  async update(id: number, updateItemDto: UpdateItemDto, userId?: number): Promise<Item> {
    const item = await this.findOne(id);
    const oldItem = { ...item };
    let categoryChanged = false;
    let locationChanged = false;
    
    if (updateItemDto.categoryId !== undefined) {
      item.categoryId = updateItemDto.categoryId;
      categoryChanged = true;
    } else if (updateItemDto.category !== undefined && typeof updateItemDto.category === 'string') {
      const categoryId = await this.getOrCreateCategoryId(updateItemDto.category);
      if (categoryId !== undefined) {
        item.categoryId = categoryId;
        categoryChanged = true;
      }
    }
    
    if (updateItemDto.locationId !== undefined) {
      item.locationId = updateItemDto.locationId;
      locationChanged = true;
    } else if (updateItemDto.location !== undefined && typeof updateItemDto.location === 'string') {
      const locationId = await this.getOrCreateLocationId(updateItemDto.location);
      if (locationId !== undefined) {
        item.locationId = locationId;
        locationChanged = true;
      }
    }
    
    // Update other fields
    if (updateItemDto.name !== undefined) item.name = updateItemDto.name;
    if (updateItemDto.description !== undefined) item.description = updateItemDto.description;
    if (updateItemDto.quantity !== undefined) item.quantity = updateItemDto.quantity;
    if (updateItemDto.value !== undefined) item.value = updateItemDto.value;
    if (updateItemDto.imageUrl !== undefined) item.imageUrl = updateItemDto.imageUrl;
    if (updateItemDto.lowStockThreshold !== undefined) item.lowStockThreshold = updateItemDto.lowStockThreshold;

    if (categoryChanged) item.category = undefined;
    if (locationChanged) item.location = undefined;
    
    await this.itemRepository.save(item);
    const savedItem = await this.findOne(id);
    
    // Log update (non-blocking)
    if (userId) {
      try {
        await this.historyService.logItemUpdated(id, userId, oldItem, savedItem);
      } catch (err) {
        console.error('Failed to log item update:', err);
      }
    }
    
    return savedItem;
  }

  async remove(id: number, userId?: number): Promise<void> {
    const item = await this.findOne(id);
    
    // Log deletion
    if (userId) {
      await this.historyService.logItemDeleted(id, userId);
    }
    
    await this.itemRepository.remove(item);
  }

  async search(query: string, userId: number, role: string, sortOptions?: ItemSortOptions): Promise<Item[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = `%${query.trim()}%`;
    const queryBuilder = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.reporter', 'reporter')
      .leftJoinAndSelect('item.category', 'category')
      .leftJoinAndSelect('item.location', 'location')
      .where(
        '(item.name LIKE :searchTerm OR item.description LIKE :searchTerm OR category.name LIKE :searchTerm OR location.name LIKE :searchTerm)',
        { searchTerm },
      );

    if (role !== 'ADMIN') {
      queryBuilder.andWhere('item.reporterId = :userId', { userId });
    }

    return this.applySort(queryBuilder, sortOptions).getMany();
  }
}
