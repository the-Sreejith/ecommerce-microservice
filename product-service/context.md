# Product Service Context

## Overview
The Product Service is a microservice within an e-commerce system that manages product-related operations. It handles product CRUD operations, integrates with AWS DynamoDB for data storage, and uses RabbitMQ for inter-service communication.

## Core Functionality
- Product management (create, read, update, delete)
- Role-based access control (admin/user roles)
- Pagination for product listings
- Input validation and error handling
- Logging system for monitoring

## Technical Stack
- **Runtime**: Node.js 18.x
- **Framework**: Express.js
- **Database**: AWS DynamoDB
- **Message Queue**: RabbitMQ
- **Authentication**: JWT-based
- **Containerization**: Docker

## Key Components
1. **Models**: Product data structure and DynamoDB operations
2. **Services**: Business logic and RabbitMQ integration
3. **Controllers**: HTTP request handling
4. **Middleware**: Authentication and authorization
5. **Routes**: API endpoint definitions
6. **Utils**: Helper functions for validation and formatting

## API Endpoints
```
GET    /api/products          # List products (paginated)
GET    /api/products/:id      # Get single product
POST   /api/products          # Create product (admin)
PUT    /api/products/:id      # Update product (admin)
DELETE /api/products/:id      # Delete product (admin)
```

## Data Flow
1. HTTP request → Controller
2. Controller → Service
3. Service → Model (DynamoDB)
4. Service → RabbitMQ (for admin checks/inventory updates)
5. Response → Client

## Security
- JWT token validation
- Admin role verification via RabbitMQ
- Input validation
- Error handling

## Integration Points
- DynamoDB for data persistence
- RabbitMQ for admin checks and inventory notifications
- JWT for authentication

## Development Environment
- Docker Compose for local development
- Local DynamoDB instance
- Local RabbitMQ instance
- Environment-based configuration

## Testing
- Unit tests for models, services, controllers
- Integration tests for API endpoints
- Test coverage reporting 