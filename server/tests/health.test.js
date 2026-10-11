const request = require('supertest');
const app = require('../app');

// The error handler logs every error; hide that noise so test output stays readable
beforeAll(() => jest.spyOn(console, 'error').mockImplementation(() => {}));
afterAll(() => console.error.mockRestore());

describe('health', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('unknown route returns 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.statusCode).toBe(404);
  });
});

describe('protected routes reject anonymous users', () => {
  test.each([
    ['/api/auth/me'],
    ['/api/transactions'],
    ['/api/cases'],
    ['/api/analytics/summary'],
  ])('GET %s returns 401', async (path) => {
    const res = await request(app).get(path);
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Not authenticated');
  });

  test('a fake token is rejected', async () => {
    const res = await request(app).get('/api/transactions').set('Authorization', 'Bearer not.a.real.token');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid or expired token');
  });

  test('registering an admin without a token returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Eve', email: 'eve@example.com', password: 'Password1', role: 'admin' });
    expect(res.statusCode).toBe(401);
  });

  test('deleting an account without a token returns 401', async () => {
    const res = await request(app).delete('/api/auth/me').send({ password: 'whatever1' });
    expect(res.statusCode).toBe(401);
  });
});

describe('input validation (rejected before touching the database)', () => {
  test('signup with a weak password returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'test@example.com', password: 'short' });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Validation failed');
  });

  test('signup with a bad email returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ name: 'Test User', email: 'not-an-email', password: 'Test@12345' });
    expect(res.statusCode).toBe(400);
  });

  test('login with a missing password returns 400', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'test@example.com' });
    expect(res.statusCode).toBe(400);
  });
});

describe('security headers', () => {
  test('helmet headers are present and the framework is hidden', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});