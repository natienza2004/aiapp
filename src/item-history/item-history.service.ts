import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemHistory, ActionType } from './item-history.entity';
import { Item } from '../items/item.entity';

@Injectable()
export class ItemHistoryService {
  constructor(
    @InjectRepository(ItemHistory)
    private readonly historyRepository: Repository<ItemHistory>,
  ) {}

  async logAction(
    itemId: number,
    userId: number,
    actionType: ActionType,
    changedField?: string,
    oldValue?: any,
    newValue?: any,
    note?: string,
  ): Promise<ItemHistory> {
    return this.historyRepository.save({
      itemId,
      userId,
      actionType,
      changedField,
      oldValue: oldValue !== undefined ? String(oldValue) : null,
      newValue: newValue !== undefined ? String(newValue) : null,
      note,
    } as any);
  }

  async logItemCreated(itemId: number, userId: number): Promise<void> {
    await this.logAction(itemId, userId, ActionType.CREATED);
  }

  async logItemUpdated(
    itemId: number,
    userId: number,
    oldItem: Partial<Item>,
    newItem: Partial<Item>,
  ): Promise<void> {
    const changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      actionType: ActionType;
    }> = [];

    // Check quantity change
    if (
      oldItem.quantity !== undefined &&
      newItem.quantity !== undefined &&
      oldItem.quantity !== newItem.quantity
    ) {
      changes.push({
        field: 'quantity',
        oldValue: oldItem.quantity,
        newValue: newItem.quantity,
        actionType: ActionType.QUANTITY_CHANGED,
      });
    }

    // Check location change - use readable names
    if (
      oldItem.locationId !== undefined &&
      newItem.locationId !== undefined &&
      oldItem.locationId !== newItem.locationId
    ) {
      changes.push({
        field: 'location',
        oldValue: oldItem.location?.name || oldItem.locationId,
        newValue: newItem.location?.name || newItem.locationId,
        actionType: ActionType.LOCATION_CHANGED,
      });
    }

    // Check category change - use readable names
    if (
      oldItem.categoryId !== undefined &&
      newItem.categoryId !== undefined &&
      oldItem.categoryId !== newItem.categoryId
    ) {
      changes.push({
        field: 'category',
        oldValue: oldItem.category?.name || oldItem.categoryId,
        newValue: newItem.category?.name || newItem.categoryId,
        actionType: ActionType.CATEGORY_CHANGED,
      });
    }

    // Check value change
    if (
      oldItem.value !== undefined &&
      newItem.value !== undefined &&
      oldItem.value !== newItem.value
    ) {
      changes.push({
        field: 'value',
        oldValue: oldItem.value,
        newValue: newItem.value,
        actionType: ActionType.VALUE_CHANGED,
      });
    }

    // Check name change
    if (
      oldItem.name !== undefined &&
      newItem.name !== undefined &&
      oldItem.name !== newItem.name
    ) {
      changes.push({
        field: 'name',
        oldValue: oldItem.name,
        newValue: newItem.name,
        actionType: ActionType.UPDATED,
      });
    }

    // Log each change
    for (const change of changes) {
      await this.logAction(
        itemId,
        userId,
        change.actionType,
        change.field,
        change.oldValue,
        change.newValue,
      );
    }

    // If no specific changes but update was called, log generic update
    if (changes.length === 0) {
      await this.logAction(itemId, userId, ActionType.UPDATED);
    }
  }

  async logItemDeleted(itemId: number, userId: number): Promise<void> {
    await this.logAction(itemId, userId, ActionType.DELETED);
  }

  async logItemRestored(itemId: number, userId: number): Promise<void> {
    await this.logAction(itemId, userId, ActionType.RESTORED);
  }

  async getItemHistory(itemId: number): Promise<ItemHistory[]> {
    return this.historyRepository.find({
      where: { itemId },
      relations: ['user', 'item'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRecentActivity(limit: number = 10, userId?: number): Promise<ItemHistory[]> {
    const query = this.historyRepository
      .createQueryBuilder('history')
      .leftJoinAndSelect('history.user', 'user')
      .leftJoinAndSelect('history.item', 'item')
      .orderBy('history.createdAt', 'DESC')
      .limit(limit);

    if (userId) {
      query.where('history.userId = :userId', { userId });
    }

    return query.getMany();
  }
}
