import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  ParseIntPipe,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  findAll(
    @Headers('x-user-role') role: string,
    @Headers('x-user-id') userIdHeader: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ) {
    const roleNormalized = (role || '').toUpperCase();
    const userId = Number(userIdHeader);
    const sortOptions = { sortBy, sortOrder };
    if (roleNormalized === 'STUDENT' && Number.isFinite(userId)) {
      return this.itemsService.findAllForUser(userId, sortOptions);
    }
    return this.itemsService.findAll(sortOptions);
  }

  @Get('search')
  search(
    @Query('query') query: string,
    @Query('sortBy') sortBy: string,
    @Query('sortOrder') sortOrder: string,
    @Headers('x-user-role') role: string,
    @Headers('x-user-id') userIdHeader: string,
  ) {
    const roleNormalized = (role || '').toUpperCase();
    const userId = Number(userIdHeader);
    return this.itemsService.search(query, userId, roleNormalized, { sortBy, sortOrder });
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createItemDto: CreateItemDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-user-id') userIdHeader: string,
  ) {
    const userId = Number(userIdHeader);
    if (!Number.isFinite(userId)) {
      throw new UnauthorizedException('Missing user id');
    }

    const dto: CreateItemDto = {
      ...createItemDto,
      reporterId: userId,
      imageUrl: file ? `/uploads/${file.filename}` : undefined,
    };

    return this.itemsService.create(dto);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto,
    @UploadedFile() file: Express.Multer.File,
    @Headers('x-user-role') role: string,
    @Headers('x-user-id') userIdHeader: string,
  ) {
    const roleNormalized = (role || '').toUpperCase();
    const userId = Number(userIdHeader);

    if (roleNormalized !== 'ADMIN') {
      if (!Number.isFinite(userId)) {
        throw new UnauthorizedException('Missing user id');
      }

      const item = await this.itemsService.findOne(id);
      if (item.reporterId !== userId) {
        throw new UnauthorizedException('Only the reporter or admins can update this item');
      }
    }

    // Transform numeric fields from FormData strings
    const dto: UpdateItemDto = {};
    
    if (updateItemDto.name !== undefined && updateItemDto.name !== '') dto.name = updateItemDto.name;
    if (updateItemDto.description !== undefined && updateItemDto.description !== '') dto.description = updateItemDto.description;
    if (updateItemDto.category !== undefined && updateItemDto.category !== '') dto.category = updateItemDto.category;
    if (updateItemDto.location !== undefined && updateItemDto.location !== '') dto.location = updateItemDto.location;
    if (updateItemDto.categoryId !== undefined && updateItemDto.categoryId !== null) {
      dto.categoryId = Number(updateItemDto.categoryId);
    }
    if (updateItemDto.locationId !== undefined && updateItemDto.locationId !== null) {
      dto.locationId = Number(updateItemDto.locationId);
    }
    if (updateItemDto.quantity !== undefined && updateItemDto.quantity !== null) {
      dto.quantity = Number(updateItemDto.quantity);
    }
    if (updateItemDto.value !== undefined && updateItemDto.value !== null) {
      dto.value = Number(updateItemDto.value);
    }
    if (updateItemDto.lowStockThreshold !== undefined && updateItemDto.lowStockThreshold !== null) {
      dto.lowStockThreshold = Number(updateItemDto.lowStockThreshold);
    }
    if (file) {
      dto.imageUrl = `/uploads/${file.filename}`;
    }

    return this.itemsService.update(id, dto, userId);
  }

  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-role') role: string,
    @Headers('x-user-id') userIdHeader: string,
  ) {
    const roleNormalized = (role || '').toUpperCase();
    const userId = Number(userIdHeader);

    if (roleNormalized !== 'ADMIN') {
      if (!Number.isFinite(userId)) {
        throw new UnauthorizedException('Missing user id');
      }

      const item = await this.itemsService.findOne(id);
      if (item.reporterId !== userId) {
        throw new UnauthorizedException('Only the reporter or admins can delete this item');
      }
    }

    return this.itemsService.remove(id, userId);
  }
}

