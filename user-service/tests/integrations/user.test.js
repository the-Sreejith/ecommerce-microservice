const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/db');
const { authenticate } = require('../../src/middleware/auth');

// Mock authentication middleware
jest.mock('../../src/middleware/auth', () => ({
    authenticate: jest.fn((req, res, next) => {
        req.user = {
            id: 'test-id',
            email: 'test@example.com',
        };
        next();
    }),
}));

// Mocking Prisma client
jest.mock('../../src/config/db', () => ({
    user: {
        findUnique: jest.fn(),
        update: jest.fn(),
    },
}));

describe('User Endpoints', () => {
    // Clear mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/users/profile/:userId', () => {
        it('should get user profile successfully', async () => {
            // Mock dependencies
            prisma.user.findUnique.mockResolvedValue({
                id: 'test-id',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
                profilePicture: null,
                isVerified: true,
                createdAt: new Date(),
            });

            // Make request
            const response = await request(app)
                .get('/api/users/profile/test-id')
                .set('x-session-id', 'valid-session-id');

            // Assertions
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.id).toBe('test-id');
        });

        // Additional profile tests...
    });

    describe('PUT /api/users/profile/:userId', () => {
        it('should update user profile successfully', async () => {
            // Mock dependencies
            prisma.user.update.mockResolvedValue({
                id: 'test-id',
                email: 'test@example.com',
                firstName: 'Updated',
                lastName: 'User',
                profilePicture: 'new-picture.jpg',
            });

            // Make request
            const response = await request(app)
                .put('/api/users/profile/test-id')
                .set('x-session-id', 'valid-session-id')
                // Continuing from tests/integration/user.test.js

                .send({
                    firstName: 'Updated',
                    lastName: 'User',
                    profilePicture: 'new-picture.jpg',
                });

            // Assertions
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.firstName).toBe('Updated');
        });

        // Additional update profile tests...
    });

    // Additional user endpoint tests...
});

