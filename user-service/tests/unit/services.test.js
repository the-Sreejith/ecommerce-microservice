const { registerUser, loginUser, createAnonymousUser } = require('../../src/services/authService');
const { getUserProfile, updateUserProfile } = require('../../src/services/userService');
const { validateSession } = require('../../src/services/sessionService');
const prisma = require('../../src/config/db');
const { hashPassword } = require('../../src/utils/passwordUtils');
const { AppError } = require('../../src/utils/appError');

// Mocking dependencies
jest.mock('../../src/config/db');
jest.mock('../../src/utils/passwordUtils', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed-password'),
  comparePassword: jest.fn().mockResolvedValue(true),
}));
jest.mock('../../src/utils/jwtUtils', () => ({
  createSession: jest.fn().mockResolvedValue({ id: 'session-id' }),
  getSessionById: jest.fn(),
  invalidateSession: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      // Mock dependencies
      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      });

      // Call service
      const result = await registerUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      });

      // Assertions
      expect(result.user.id).toBe('user-id');
      expect(result.sessionId).toBe('session-id');
      expect(hashPassword).toHaveBeenCalledWith('password123');
      expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          email: 'test@example.com',
          password: 'hashed-password',
        }),
      }));
    });

    it('should throw an error if user already exists', async () => {
      // Mock dependencies
      prisma.user.findUnique.mockResolvedValue({
        id: 'existing-id',
        email: 'test@example.com',
      });

      // Call service and expect error
      await expect(registerUser({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      })).rejects.toThrow(AppError);
    });

    // Additional register tests...
  });

  // Additional service tests...
});