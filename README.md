# Auth Service

Authentication and authorization service with OAuth (Google, Steam) and JWT support.

## Description

The service provides API for:
- User registration and login
- OAuth authentication via Google and Steam
- JWT token management
- Service health monitoring

## Requirements

- Node.js 18+
- PostgreSQL 15+
- Docker and Docker Compose (optional)

## Installation and Setup

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd auth-service
```

2. Install dependencies:
```bash
npm install
```

3. Create environment files:
```bash
cp .env.example .env.development
```

4. Start the database:
```bash
docker-compose up -d postgres
```

5. Run migrations:
```bash
npm run migration:run
```

6. Start the service:
```bash
npm run start:dev
```

### Production Deployment

1. Create `.env.production` file with production settings
2. Build the application:
```bash
npm run build
```

3. Start using Docker Compose:
```bash
docker-compose -f docker-compose.yml up -d
```

## API Documentation

### Authentication

#### Registration
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "nickname": "username"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}
```

#### Google OAuth
```http
GET /auth/google
```

#### Steam OAuth
```http
GET /auth/steam
```

#### Token Refresh
```http
POST /auth/refresh
Content-Type: application/json

{
  "userId": "user-id",
  "refreshToken": "refresh-token"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <access-token>
```

### Monitoring

#### Health Check
```http
GET /health
```
Checks service status, database connection, and system resources.

#### Metrics
```http
GET /metrics
```
Returns basic service metrics:
- Uptime
- Request count
- Memory usage
- CPU usage

## Monitoring

### Logs

Logs are stored in the `logs/` directory:
- `error-YYYY-MM-DD.log` - error logs
- `combined-YYYY-MM-DD.log` - all logs

### Metrics

The service provides basic metrics via the `/metrics` endpoint. For comprehensive monitoring, it's recommended to:

1. Set up metric collection in Prometheus
2. Configure visualization in Grafana
3. Set up alerts for critical events

### Health Checks

The `/health` endpoint checks:
- Database availability
- Disk space usage
- Memory usage
- Overall service status

## Security

- All passwords are hashed using bcrypt
- JWT tokens have limited lifetime
- DDoS protection through rate limiting
- Secure headers configured via Helmet
- CORS configured to prevent unwanted requests

## Development

### Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # Users module
├── health/         # Monitoring module
├── logger/         # Logging module
└── app.module.ts   # Main module
```

### Commands

```bash
# Start in development mode
npm run start:dev

# Run tests
npm run test

# Lint check
npm run lint

# Create migration
npm run migration:create

# Run migrations
npm run migration:run
```

## License

MIT
