import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';
import { Location } from '../locations/location.entity';
import { Reminder } from '../reminders/reminder.entity';

@Entity({ name: 'items' })
export class Item {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  categoryId?: number;

  @Column({ type: 'int', nullable: true })
  locationId?: number;

  @Column({ type: 'int', default: 0 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  value: number;

  @Column({ type: 'int', nullable: true, default: 5 })
  lowStockThreshold?: number;

  @Column({ length: 255, nullable: true })
  imageUrl?: string;

  @Column({ type: 'int' })
  reporterId: number;

  @ManyToOne(() => User, (user) => user.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reporterId' })
  reporter: User;

  @ManyToOne(() => Category, (category) => category.items, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  category?: Category;

  @ManyToOne(() => Location, (location) => location.items, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'locationId' })
  location?: Location;

  @OneToMany(() => Reminder, (reminder) => reminder.item)
  reminders: Reminder[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  // Virtual field - computed
  get totalValue(): number {
    return Number(this.value) * this.quantity;
  }

  get isLowStock(): boolean {
    return this.quantity <= (this.lowStockThreshold || 5);
  }
}
