import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';

describe('RentLink Backend API Test Suite', () => {
  let tenantToken = '';
  let ownerToken = '';
  let adminToken = '';
  let testPropertyId = '';

  before(async () => {
    await prisma.$connect();
  });

  after(async () => {
    await prisma.$disconnect();
  });

  test('GET /health returns 200 OK', async () => {
    const res = await request(app).get('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
  });

  test('POST /api/auth/login authenticates seeded tenant user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'ayesha.khan@example.com',
      password: 'rentlink123',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, 'ayesha.khan@example.com');
    tenantToken = res.body.data.token;
  });

  test('POST /api/auth/login authenticates canonical tenant@rentlink.pk with Password123!', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'tenant@rentlink.pk',
      password: 'Password123!',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.email, 'tenant@rentlink.pk');
  });

  test('POST /api/auth/login authenticates seeded owner user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'contact@karimbuilders.pk',
      password: 'rentlink123',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.role, 'owner');
    ownerToken = res.body.data.token;
  });

  test('POST /api/auth/login authenticates canonical owner@rentlink.pk with Password123!', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'owner@rentlink.pk',
      password: 'Password123!',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.role, 'owner');
  });

  test('POST /api/auth/login authenticates seeded admin user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@rentlink.pk',
      password: 'rentlink123',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
    assert.strictEqual(res.body.data.user.role, 'admin');
    adminToken = res.body.data.token;
  });

  test('POST /api/auth/login authenticates canonical admin@rentlink.pk with Admin123!', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'admin@rentlink.pk',
      password: 'Admin123!',
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.token);
  });

  test('GET /api/properties returns list of approved properties', async () => {
    const res = await request(app).get('/api/properties');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.items));
    assert.ok(res.body.data.items.length > 0);
    testPropertyId = res.body.data.items[0].id;
  });

  test('GET /api/properties/:id returns single property details', async () => {
    const res = await request(app).get(`/api/properties/${testPropertyId}`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.id, testPropertyId);
    assert.ok(res.body.data.title);
  });

  test('GET /api/properties/stats returns analytics statistics', async () => {
    const res = await request(app).get('/api/properties/stats');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(res.body.data.totalApproved >= 0);
  });

  test('GET /api/advertisements/active returns active ads', async () => {
    const res = await request(app).get('/api/advertisements/active');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  test('POST /api/favorites/toggle toggles favorite property for authenticated tenant', async () => {
    const res = await request(app)
      .post('/api/favorites/toggle')
      .set('Authorization', `Bearer ${tenantToken}`)
      .send({ propertyId: testPropertyId });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(typeof res.body.data.favorited, 'boolean');
  });

  test('GET /api/notifications returns user notification list', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${tenantToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok(Array.isArray(res.body.data.items));
  });

  test('GET /api/admin/overview returns dashboard metrics for admin', async () => {
    const res = await request(app)
      .get('/api/admin/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.ok('totalProperties' in res.body.data);
    assert.ok('totalUsers' in res.body.data);
  });

  test('GET /api/admin/settings returns system platform settings', async () => {
    const res = await request(app)
      .get('/api/admin/settings')
      .set('Authorization', `Bearer ${adminToken}`);

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.platformName, 'RentLink');
  });
});
