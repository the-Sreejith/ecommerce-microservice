# Product Service

A microservice for managing products in an e-commerce system. Built with Node.js, Express, AWS DynamoDB, and RabbitMQ.

## Features

- CRUD operations for products
- JWT-based authentication
- Role-based access control (Admin/User)
- Pagination support
- Input validation
- Error handling
- Logging
- Message queue integration
- AWS DynamoDB integration

## Prerequisites

- Node.js 18.x or later
- Docker and Docker Compose
- AWS Account (for DynamoDB)
- RabbitMQ server

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
DYNAMODB_TABLE=products

# JWT Configuration
JWT_SECRET=your_jwt_secret

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
ADMIN_CHECK_QUEUE=admin_check
INVENTORY_NOTIFICATION_QUEUE=inventory_notification
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd product-service
```

2. Install dependencies:
```bash
npm install
```

3. Create and configure the `.env` file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## Running Locally

### Using Docker Compose (Recommended)

1. Start all services:
```bash
docker-compose up -d
```

2. The service will be available at `http://localhost:3001`

### Without Docker

1. Start RabbitMQ and DynamoDB Local (if using local instances)

2. Start the service:
```bash
npm start
```

## API Endpoints

### Products

- `GET /api/products` - Get all products (with pagination)
- `GET /api/products/:id` - Get a specific product
- `POST /api/products` - Create a new product (Admin only)
- `PUT /api/products/:id` - Update a product (Admin only)
- `DELETE /api/products/:id` - Delete a product (Admin only)

### Authentication

- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user

## Testing

### Unit Tests

```bash
npm test
```

### Integration Tests

```bash
npm run test:integration
```

### Test Coverage

```bash
npm run test:coverage
```

## Docker Commands

### Build the Image

```bash
docker build -t product-service .
```

### Run the Container

```bash
docker run -p 3001:3001 --env-file .env product-service
```

## Project Structure

```
product-service/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Custom middleware
│   ├── models/        # Data models
│   ├── routes/        # API routes
│   ├── services/      # Business logic
│   ├── utils/         # Utility functions
│   └── server.js      # Application entry point
├── tests/             # Test files
├── .env.example       # Example environment variables
├── .dockerignore      # Docker ignore file
├── docker-compose.yml # Docker Compose configuration
├── Dockerfile         # Docker configuration
├── package.json       # Project dependencies
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Express.js team
- AWS SDK team
- RabbitMQ team
- All contributors to this project 