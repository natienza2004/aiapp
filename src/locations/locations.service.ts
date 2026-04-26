import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from './location.entity';
import { CreateLocationDto } from './dto/create-location.dto';

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
  ) {}

  findAll(): Promise<Location[]> {
    return this.locationRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number): Promise<Location> {
    const location = await this.locationRepository.findOne({ where: { id }, relations: ['items'] });
    if (!location) throw new NotFoundException(`Location with id ${id} not found`);
    return location;
  }

  create(dto: CreateLocationDto): Promise<Location> {
    const location = this.locationRepository.create(dto);
    return this.locationRepository.save(location);
  }

  async update(id: number, dto: Partial<CreateLocationDto>): Promise<Location> {
    const location = await this.findOne(id);
    Object.assign(location, dto);
    return this.locationRepository.save(location);
  }

  async remove(id: number): Promise<void> {
    const location = await this.findOne(id);
    await this.locationRepository.remove(location);
  }
}
