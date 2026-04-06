import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Items API (e2e)', () => {
  let app: INestApplication<App>;
  let itemId: number;
  let testUserId1: number; // User who creates items
  let testUserId2: number; // Another test user
  let testUserId3: number; // Third test user
  let adminUserId: number; // Admin user

  // Setup: Create test app and test users before all tests
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
        dismissDefaultMessages: false,
      }),
    );
    await app.init();

    // Create test users
    const user1Res = await request(app.getHttpServer())
      .post('/users/register')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Test User 1',
        email: `user1-${Date.now()}@test.com`,
        password: 'password123',
        role: 'STUDENT',
      });
    testUserId1 = user1Res.body.id;

    const user2Res = await request(app.getHttpServer())
      .post('/users/register')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Test User 2',
        email: `user2-${Date.now()}@test.com`,
        password: 'password123',
        role: 'STUDENT',
      });
    testUserId2 = user2Res.body.id;

    const user3Res = await request(app.getHttpServer())
      .post('/users/register')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Test User 3',
        email: `user3-${Date.now()}@test.com`,
        password: 'password123',
        role: 'STUDENT',
      });
    testUserId3 = user3Res.body.id;

    const adminRes = await request(app.getHttpServer())
      .post('/users/register')
      .set('Content-Type', 'application/json')
      .send({
        name: 'Admin User',
        email: `admin-${Date.now()}@test.com`,
        password: 'password123',
        role: 'ADMIN',
      });
    adminUserId = adminRes.body.id;

    console.log(`✅ Created test users:
      User 1 (STUDENT): ${testUserId1}
      User 2 (STUDENT): ${testUserId2}
      User 3 (STUDENT): ${testUserId3}
      Admin: ${adminUserId}`);
  });

  afterAll(async () => {
    await app.close();
  });

  // Test: GET /items (fetch all items)
  describe('GET /items', () => {
    it('should return an array of items with 200 status', () => {
      return request(app.getHttpServer())
        .get('/items')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });

    it('should filter items for STUDENT role', () => {
      return request(app.getHttpServer())
        .get('/items')
        .set('x-user-id', `${testUserId1}`)
        .set('x-user-role', 'STUDENT')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  // Test: POST /items (create new item)
  describe('POST /items', () => {
    it('should create a new item with valid data', () => {
      const createItemDto = {
        name: 'Test Laptop',
        quantity: 5,
        category: 'Electronics',
        description: 'A test laptop for inventory',
      };

      return request(app.getHttpServer())
        .post('/items')
        .set('x-user-id', `${testUserId1}`)
        .set('Content-Type', 'application/json')
        .send(createItemDto)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.name).toBe(createItemDto.name);
          expect(res.body.quantity).toBe(createItemDto.quantity);
          expect(res.body.category).toBe(createItemDto.category);
          expect(res.body.description).toBe(createItemDto.description);
          expect(res.body.reporterId).toBe(testUserId1);
          itemId = res.body.id; // Save ID for later tests
        });
    });

    it('should return 401 if x-user-id header is missing', () => {
      const createItemDto = {
        name: 'Test Item',
        quantity: 10,
        category: 'Test',
        description: 'Missing user ID',
      };

      return request(app.getHttpServer())
        .post('/items')
        .set('Content-Type', 'application/json')
        .send(createItemDto)
        .expect(401);
    });

    it('should return 400 if required fields are missing', () => {
      return request(app.getHttpServer())
        .post('/items')
        .set('x-user-id', `${testUserId1}`)
        .set('Content-Type', 'application/json')
        .send({ name: 'Test' }) // Missing quantity, category, description
        .expect(400);
    });
  });

  // Test: GET /items/:id (fetch single item)
  describe('GET /items/:id', () => {
    it('should return a single item with 200 status', () => {
      if (!itemId) {
        console.log('⚠️  Skipping: itemId not created yet');
        return;
      }

      return request(app.getHttpServer())
        .get(`/items/${itemId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name');
          expect(res.body).toHaveProperty('quantity');
        });
    });

    it('should return 400 for invalid item ID (non-numeric)', () => {
      return request(app.getHttpServer())
        .get('/items/invalid-id')
        .expect(400);
    });

    it('should return 404 for non-existent item ID', () => {
      return request(app.getHttpServer())
        .get('/items/99999')
        .expect(404);
    });
  });

  // Test: PATCH /items/:id (update item)
  describe('PATCH /items/:id', () => {
    it('should update an item as admin', () => {
      if (!itemId) {
        console.log('⚠️  Skipping: itemId not created yet');
        return;
      }

      const updateItemDto = {
        quantity: 20,
        description: 'Updated description',
      };

      return request(app.getHttpServer())
        .patch(`/items/${itemId}`)
        .set('x-user-id', `${adminUserId}`)
        .set('x-user-role', 'ADMIN')
        .set('Content-Type', 'application/json')
        .send(updateItemDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.quantity).toBe(updateItemDto.quantity);
          expect(res.body.description).toBe(updateItemDto.description);
        });
    });

    it('should allow reporter to update their own item', () => {
      if (!itemId) {
        console.log('⚠️  Skipping: itemId not created yet');
        return;
      }

      const updateItemDto = {
        quantity: 15,
      };

      return request(app.getHttpServer())
        .patch(`/items/${itemId}`)
        .set('x-user-id', `${testUserId1}`) // Same user who created it
        .set('x-user-role', 'STUDENT')
        .set('Content-Type', 'application/json')
        .send(updateItemDto)
        .expect(200);
    });

    it('should deny update if user is not reporter or admin', () => {
      if (!itemId) {
        console.log('⚠️  Skipping: itemId not created yet');
        return;
      }

      return request(app.getHttpServer())
        .patch(`/items/${itemId}`)
        .set('x-user-id', `${testUserId2}`) // Different user
        .set('x-user-role', 'STUDENT')
        .set('Content-Type', 'application/json')
        .send({ quantity: 99 })
        .expect(401); // Unauthorized
    });

    it('should return 400 for invalid item ID', () => {
      return request(app.getHttpServer())
        .patch('/items/invalid')
        .set('x-user-id', `${adminUserId}`)
        .set('x-user-role', 'ADMIN')
        .set('Content-Type', 'application/json')
        .send({ quantity: 10 })
        .expect(400);
    });
  });

  // Test: DELETE /items/:id (delete item)
  describe('DELETE /items/:id', () => {
    let deleteItemId: number;

    beforeAll(async () => {
      // Create an item to delete
      const res = await request(app.getHttpServer())
        .post('/items')
        .set('x-user-id', `${testUserId2}`)
        .set('Content-Type', 'application/json')
        .send({
          name: 'Item to Delete',
          quantity: 1,
          category: 'Temp',
          description: 'Will be deleted',
        });
      deleteItemId = res.body.id;
    });

    it('should delete an item as admin', () => {
      return request(app.getHttpServer())
        .delete(`/items/${deleteItemId}`)
        .set('x-user-id', `${adminUserId}`)
        .set('x-user-role', 'ADMIN')
        .expect(200);
    });

    it('should allow reporter to delete their own item', async () => {
      // Create another item
      const createRes = await request(app.getHttpServer())
        .post('/items')
        .set('x-user-id', `${testUserId3}`)
        .set('Content-Type', 'application/json')
        .send({
          name: 'My Item',
          quantity: 1,
          category: 'Temp',
          description: 'I created this',
        });

      const ownItemId = createRes.body.id;

      // Delete as reporter
      return request(app.getHttpServer())
        .delete(`/items/${ownItemId}`)
        .set('x-user-id', `${testUserId3}`) // Same user who created it
        .set('x-user-role', 'STUDENT')
        .expect(200);
    });

    it('should deny deletion if user is not reporter or admin', () => {
      return request(app.getHttpServer())
        .delete(`/items/${itemId}`)
        .set('x-user-id', `${testUserId2}`) // Different user
        .set('x-user-role', 'STUDENT')
        .expect(401); // Unauthorized
    });

    it('should return 400 for invalid item ID', () => {
      return request(app.getHttpServer())
        .delete('/items/not-a-number')
        .set('x-user-id', `${adminUserId}`)
        .set('x-user-role', 'ADMIN')
        .expect(400);
    });

    it('should return 404 when deleting non-existent item', () => {
      return request(app.getHttpServer())
        .delete('/items/99999')
        .set('x-user-id', `${adminUserId}`)
        .set('x-user-role', 'ADMIN')
        .expect(404);
    });
  });

  // Test: Root endpoint (health check)
  describe('GET /', () => {
    it('should return "Hello World!" with 200 status', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });
});

