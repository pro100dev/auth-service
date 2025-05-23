# Auth Service

Authentication and authorization service with JWT and OAuth2 support.

## Requirements

- Node.js 20+
- PostgreSQL 15+
- Docker and Docker Compose (optional)

## Installation and Setup

### Local Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd auth-service
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in the project root:
```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=auth_service

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=3600
JWT_REFRESH_EXPIRES_IN=604800

# OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Application
PORT=3000
NODE_ENV=dev
```

4. Run migrations:
```bash
npm run migration:run
```

5. Start the application:
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

### Docker Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd auth-service
```

2. Create `.env` file (see example above)

3. Start the application:

```bash
# Development mode (with hot-reload)
docker-compose up --build

# Production mode
NODE_ENV=prod docker-compose up --build
```

The application will be available at: http://localhost:3000

## Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/               # Users module
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── common/              # Common utilities and decorators
├── config/              # Application configuration
└── main.ts             # Entry point
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login to the system
- `POST /auth/refresh` - Refresh token
- `GET /auth/google` - Google OAuth authentication
- `GET /auth/google/callback` - Google OAuth callback

### Users

- `GET /users/me` - Get current user information
- `PATCH /users/me` - Update user information
- `DELETE /users/me` - Delete user

## Development

### Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Linting

```bash
npm run lint
```

## License

MIT
