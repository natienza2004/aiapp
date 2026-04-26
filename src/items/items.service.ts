import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Item } from './item.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Category } from '../categories/category.entity';
import { Location } from '../locations/location.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  findAll(): Promise<Item[]> {
    return this.itemRepository.find({ 
      relations: ['reporter', 'category', 'location'], 
      order: { createdAt: 'DESC' } 
    });
  }

  findAllForUser(userId: number): Promise<Item[]> {
    return this.itemRepository.find({
      relations: ['reporter', 'category', 'location'],
      where: { reporterId: userId },
      order: { createdAt: 'DESC' },
    });
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
    const { category, location, ...itemData } = createItemDto;
    
    // Handle string category - find or create
    if (category && typeof category === 'string') {
      let categoryEntity = await this.categoryRepository.findOne({ where: { name: category } });
      if (!categoryEntity) {
        categoryEntity = await this.categoryRepository.save({ name: category });
      }
      itemData.categoryId = categoryEntity.id;
    }
    
    // Handle string location - find or create
    if (location && typeof location === 'string') {
      let locationEntity = await this.locationRepository.findOne({ where: { name: location } });
      if (!locationEntity) {
        locationEntity = await this.locationRepository.save({ name: location });
      }
      itemData.locationId = locationEntity.id;
    }
    
    const item = this.itemRepository.create(itemData);
    return this.itemRepository.save(item);
  }

  async update(id: number, updateItemDto: UpdateItemDto): Promise<Item> {
    const item = await this.findOne(id);
    const { category, location, ...updateData } = updateItemDto;
    
    // Handle string category - find or create
    if (category && typeof category === 'string') {
      let categoryEntity = await this.categoryRepository.findOne({ where: { name: category } });
      if (!categoryEntity) {
        categoryEntity = await this.categoryRepository.save({ name: category });
      }
      updateData.categoryId = categoryEntity.id;
    }
    
    // Handle string location - find or create
    if (location && typeof location === 'string') {
      let locationEntity = await this.locationRepository.findOne({ where: { name: location } });
      if (!locationEntity) {
        locationEntity = await this.locationRepository.save({ name: location });
      }
      updateData.locationId = locationEntity.id;
    }
    
    Object.assign(item, updateData);
    return this.itemRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.itemRepository.remove(item);
  }

  async search(query: string, userId: number, role: string): Promise<Item[]> {
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

    return queryBuilder.orderBy('item.createdAt', 'DESC').getMany();
  }
}
