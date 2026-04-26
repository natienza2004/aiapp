import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reminder } from './reminder.entity';
import { CreateReminderDto } from './dto/create-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(
    @InjectRepository(Reminder)
    private readonly reminderRepository: Repository<Reminder>,
  ) {}

  findAll(): Promise<Reminder[]> {
    return this.reminderRepository.find({ 
      relations: ['item'], 
      order: { expiryDate: 'ASC' } 
    });
  }

  async findByItem(itemId: number): Promise<Reminder[]> {
    return this.reminderRepository.find({ 
      where: { itemId }, 
      order: { expiryDate: 'ASC' } 
    });
  }

  async findUpcoming(days: number = 7): Promise<Reminder[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.reminderRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.item', 'item')
      .where('reminder.expiryDate BETWEEN :today AND :futureDate', { today, futureDate })
      .andWhere('reminder.isCompleted = :isCompleted', { isCompleted: false })
      .orderBy('reminder.expiryDate', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Reminder> {
    const reminder = await this.reminderRepository.findOne({ where: { id }, relations: ['item'] });
    if (!reminder) throw new NotFoundException(`Reminder with id ${id} not found`);
    return reminder;
  }

  create(dto: CreateReminderDto): Promise<Reminder> {
    const reminder = this.reminderRepository.create(dto);
    return this.reminderRepository.save(reminder);
  }

  async update(id: number, dto: Partial<CreateReminderDto>): Promise<Reminder> {
    const reminder = await this.findOne(id);
    Object.assign(reminder, dto);
    return this.reminderRepository.save(reminder);
  }

  async remove(id: number): Promise<void> {
    const reminder = await this.findOne(id);
    await this.reminderRepository.remove(reminder);
  }
}
