# User Service
  
  This service handles user authentication and profile management for the e-commerce microservice architecture.
  
  ## Features
  
  - User registration and login (email/password)
  - Anonymous user login
  - Session-based authentication with database storage
  - User profile management
  - JWT token validation
  - OAuth integration support (placeholder for Google Auth)
  - Phone authentication support (placeholder)
  
  ## Tech Stack
  
  - Node.js
  - Express.js
  - Prisma ORM
  - PostgreSQL
  - JWT
  - bcrypt for password hashing
  
  ## Getting Started
  
  ### Prerequisites
  
  - Node.js (v14 or later)
  - PostgreSQL (v12 or later)
  
  ### Installation
  
  1. Clone the repository
  2. Install dependencies:
     ```bash
     npm install
     ```
  3. Copy the `.env.example` file to `.env` and update with your configuration
  4. Run database migrations:
     ```bash
     npm run migrate
     ```
  5. Start the service:
     ```bash
     npm start
     ```
  
  For development:
  ```bash
  npm run dev
  ```
  
  ### Running Tests
  
  ```bash
  npm test
  ```
  
  ## API Endpoints
  
  ### Authentication
  
  - `POST /api/users/register` - Register a new user
  - `POST /api/users/login` - Login with email and password
  - `POST /api/users/logout` - Logout (invalidate session)
  - `POST /api/users/refresh` - Refresh authentication token
  - `POST /api/users/anonymous` - Create anonymous user
  - `GET /api/users/session/validate` - Validate session
  
  ### User Profile
  
  - `GET /api/users/profile/:userId` - Get user profile
  - `PUT /api/users/profile/:userId` - Update user profile
  
  ## Security
  
  - HTTPS should be enabled in production
  - Passwords are hashed using bcrypt
  - JWT tokens are stored in the database with only session IDs passed to clients
  - Authentication middleware protects sensitive endpoints
  