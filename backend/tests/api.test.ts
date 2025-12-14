import request from 'supertest';
import app from '../src/server';
// @ts-ignore
import { PrismaClient } from '@prisma/client';

// Declare Jest globals to satisfy TypeScript without @types/jest
declare const describe: any;
declare const test: any;
declare const expect: any;
declare const beforeAll: any;
declare const afterAll: any;

const prisma = new PrismaClient();

// Clean DB before tests
beforeAll(async () => {
  await prisma.sweet.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Sweet Shop API (TDD)', () => {
  let adminToken: string;
  let userToken: string;
  let sweetId: number;

  // AUTH TEST
  test('POST /api/auth/register should create admin user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'admin@test.com', password: 'password123', name: 'Admin' });
    
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.role).toBe('ADMIN');
    adminToken = res.body.token;
  });

  test('POST /api/auth/register should create normal user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'user@test.com', password: 'password123', name: 'User' });
    
    expect(res.status).toBe(201);
    expect(res.body.user.role).toBe('USER');
    userToken = res.body.token;
  });

  // SWEET MANAGEMENT (Admin)
  test('POST /api/sweets should allow Admin to add sweets with image', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ 
          name: 'Fizzy Pop', 
          category: 'Hard Candy', 
          price: 1.50, 
          quantity: 10,
          imageUrl: 'http://test.com/image.png' 
      });
    
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Fizzy Pop');
    expect(res.body.imageUrl).toBe('http://test.com/image.png');
    sweetId = res.body.id;
  });

  test('POST /api/sweets should block non-admins', async () => {
    const res = await request(app)
      .post('/api/sweets')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'Hacked Sweet', category: 'Bad', price: 0, quantity: 10 });
    
    expect(res.status).toBe(403);
  });

  test('PUT /api/sweets/:id should update sweet details', async () => {
    const res = await request(app)
      .put(`/api/sweets/${sweetId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price: 2.00, name: 'Super Fizzy Pop' });
    
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(2.00);
    expect(res.body.name).toBe('Super Fizzy Pop');
  });

  // INVENTORY LOGIC
  test('GET /api/sweets should list sweets publically', async () => {
    const res = await request(app).get('/api/sweets');
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/sweets/search should filter sweets', async () => {
    // We have 'Super Fizzy Pop' (Hard Candy)
    const res = await request(app).get('/api/sweets/search?name=Fizzy');
    expect(res.status).toBe(200);
    expect(res.body[0].name).toContain('Fizzy');
  });

  test('POST /purchase should decrease quantity', async () => {
    // Initial qty was 10
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 2 });
    
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(8); // 10 - 2
  });

  test('POST /purchase should fail if insufficient stock', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/purchase`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 100 }); // Only 8 left
    
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Insufficient stock/i);
  });

  test('POST /api/sweets/:id/restock should increase quantity', async () => {
    // Current qty is 8
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity: 10 });
    
    expect(res.status).toBe(200);
    expect(res.body.quantity).toBe(18); // 8 + 10
  });

  test('POST /api/sweets/:id/restock should fail for non-admin', async () => {
    const res = await request(app)
      .post(`/api/sweets/${sweetId}/restock`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ quantity: 10 });
    
    expect(res.status).toBe(403);
  });
});