const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/db');

// Mocking Prisma client
jest.mock('../../src/config/db', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  session: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
}));

describe('Authentication Endpoints', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      // Mock dependencies
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'test-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });
      prisma.session.create.mockResolvedValue({
        id: 'session-id',
      });

      // Make request
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      // Assertions
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.userId).toBe('test-id');
      expect(response.body.sessionId).toBe('session-id');
    });

    it('should return 409 if user already exists', async () => {
      // Mock dependencies
      prisma.user.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: 'test@example.com',
      });

      // Make request
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      // Assertions
      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if required fields are missing', async () => {
      // Make request with missing fields
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          // Missing password
          firstName: 'Test',
          lastName: 'User',
        });

      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/login', () => {
    it('should login a user successfully', async () => {
      // Mock dependencies
      prisma.user.findUnique.mockResolvedValue({
        id: 'test-id',
        email: 'test@example.com',
        password: '$2b$10$abcdefghijklmnopqrstuvwxyz', // Mocked hashed password
        firstName: 'Test',
        lastName: 'User',
      });
      
      // Mock bcrypt compare to return true
      jest.mock('bcrypt', () => ({
        compare: jest.fn().mockResolvedValue(true),
      }));
      
      prisma.session.create.mockResolvedValue({
        id: 'session-id',
      });

      // Make request
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.sessionId).toBe('session-id');
    });

    // Additional login tests...
  });

  // Additional authentication endpoint tests...
});

