const authMiddleware = require('../../middleware/auth.middleware');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

// Mock jwt
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock request object
    mockReq = {
      headers: {}
    };
    
    // Mock response object
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    
    // Mock next function
    mockNext = jest.fn();
  });
  
  describe('authenticateToken', () => {
    test('should set user in request when valid token is provided', async () => {
      // Arrange
      const mockUser = { id: 'user-123', email: 'test@example.com' };
      const mockToken = 'valid-token';
      
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockReturnValueOnce(mockUser);
      
      // Act
      await authMiddleware.authenticateToken(mockReq, mockRes, mockNext);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(mockToken, config.jwtSecret);
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
    
    test('should return 401 when no token is provided', async () => {
      // Act
      await authMiddleware.authenticateToken(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Access token is required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
    
    test('should return 401 when invalid token is provided', async () => {
      // Arrange
      const mockToken = 'invalid-token';
      mockReq.headers.authorization = `Bearer ${mockToken}`;
      jwt.verify.mockImplementationOnce(() => {
        throw new Error('Invalid token');
      });
      
      // Act
      await authMiddleware.authenticateToken(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
  
  describe('requireAdmin', () => {
    beforeEach(() => {
      // Mock RabbitMQ channel
      const mockChannel = {
        assertQueue: jest.fn().mockResolvedValue({ queue: 'reply-queue' }),
        sendToQueue: jest.fn(),
        consume: jest.fn((queue, callback) => {
          // Simulate RabbitMQ response
          const msg = {
            content: Buffer.from(JSON.stringify({ isAdmin: true })),
            properties: { correlationId: expect.any(String) }
          };
          callback(msg);
        })
      };
      
      // Mock RabbitMQ config
      jest.mock('../../config/rabbitmq', () => ({
        getChannel: jest.fn().mockReturnValue(mockChannel),
        ADMIN_CHECK_QUEUE: 'admin_check_test'
      }));
    });
    
    test('should call next when user is admin', async () => {
      // Arrange
      mockReq.user = { id: 'admin-user' };
      
      // Act
      await authMiddleware.requireAdmin(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockNext).toHaveBeenCalled();
      expect(mockRes.status).not.toHaveBeenCalled();
    });
    
    test('should return 403 when user is not admin', async () => {
      // Arrange
      mockReq.user = { id: 'non-admin-user' };
      
      // Override the consume mock to return non-admin status
      const mockChannel = {
        assertQueue: jest.fn().mockResolvedValue({ queue: 'reply-queue' }),
        sendToQueue: jest.fn(),
        consume: jest.fn((queue, callback) => {
          const msg = {
            content: Buffer.from(JSON.stringify({ isAdmin: false })),
            properties: { correlationId: expect.any(String) }
          };
          callback(msg);
        })
      };
      
      // Mock RabbitMQ config
      jest.mock('../../config/rabbitmq', () => ({
        getChannel: jest.fn().mockReturnValue(mockChannel),
        ADMIN_CHECK_QUEUE: 'admin_check_test'
      }));
      
      // Act
      await authMiddleware.requireAdmin(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(403);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Admin access required'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
    
    test('should handle RabbitMQ errors', async () => {
      // Arrange
      mockReq.user = { id: 'admin-user' };
      
      // Override the consume mock to throw an error
      const mockChannel = {
        assertQueue: jest.fn().mockResolvedValue({ queue: 'reply-queue' }),
        sendToQueue: jest.fn(),
        consume: jest.fn((queue, callback) => {
          callback(new Error('RabbitMQ error'));
        })
      };
      
      // Mock RabbitMQ config
      jest.mock('../../config/rabbitmq', () => ({
        getChannel: jest.fn().mockReturnValue(mockChannel),
        ADMIN_CHECK_QUEUE: 'admin_check_test'
      }));
      
      // Act
      await authMiddleware.requireAdmin(mockReq, mockRes, mockNext);
      
      // Assert
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Error checking admin status'
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 