import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Item } from '../items/item.entity';
import { User } from '../users/user.entity';

export enum ActionType {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  QUANTITY_CHANGED = 'QUANTITY_CHANGED',
  LOCATION_CHANGED = 'LOCATION_CHANGED',
  CATEGORY_CHANGED = 'CATEGORY_CHANGED',
  VALUE_CHANGED = 'VALUE_CHANGED',
  DELETED = 'DELETED',
  RESTORED = 'RESTORED',
}

@Entity({ name: 'item_history' })
export class ItemHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  itemId: number;

  @Column({ type: 'int' })
  userId: number;

  @Column({ type: 'enum', enum: ActionType })
  actionType: ActionType;

  @Column({ length: 100, nullable: true })
  changedField?: string;

  @Column({ type: 'text', nullable: true })
  oldValue?: string;

  @Column({ type: 'text', nullable: true })
  newValue?: string;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @ManyToOne(() => Item, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'itemId' })
  item: Item;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}
