import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Item } from './items/item.entity';
import { ItemsModule } from './items/items.module';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { Category } from './categories/category.entity';
import { CategoriesModule } from './categories/categories.module';
import { Location } from './locations/location.entity';
import { LocationsModule } from './locations/locations.module';
import { Reminder } from './reminders/reminder.entity';
import { RemindersModule } from './reminders/reminders.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ReportsModule } from './reports/reports.module';
import { ItemHistoryModule } from './item-history/item-history.module';
import { ItemHistory } from './item-history/item-history.entity';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'frontend'),
      exclude: ['/items*', '/users*', '/uploads*', '/categories*', '/locations*', '/reminders*', '/dashboard*', '/reports*'],
    }),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 3306),
      username: process.env.DB_USER ?? 'root',
      password: process.env.DB_PASS ?? '',
      database: process.env.DB_NAME ?? 'inventory_db',
      entities: [Item, User, Category, Location, Reminder, ItemHistory],
      synchronize: true,
    }),
    ItemsModule,
    UsersModule,
    CategoriesModule,
    LocationsModule,
    RemindersModule,
    DashboardModule,
    ReportsModule,
    ItemHistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
