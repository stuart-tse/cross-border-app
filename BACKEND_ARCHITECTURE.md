# Backend Architecture Guide

## 🏗️ Architecture Overview

The Cross-Border Vehicles backend has been redesigned with a modern, scalable architecture that follows enterprise-grade patterns and best practices.

### Key Architectural Principles

- **Service Layer Pattern**: Business logic separated into focused services
- **Repository Pattern**: Data access abstraction with consistent interfaces
- **Dependency Injection**: Centralized service management with ServiceContainer
- **Caching Strategy**: Multi-layer caching with Redis and Next.js cache
- **Structured Logging**: Comprehensive logging with Winston
- **API Versioning**: RESTful APIs with versioning support
- **Security First**: Rate limiting, authentication, and authorization middleware
- **Type Safety**: Full TypeScript coverage with Zod validation

## 📁 Directory Structure

```
src/lib/
├── config/                     # Configuration management
│   └── index.ts               # Environment validation & config
├── middleware/                 # API middleware
│   └── ApiMiddleware.ts       # Rate limiting, auth, validation
├── repositories/              # Data access layer
│   ├── BaseRepository.ts      # Generic repository with CRUD
│   └── UserRepository.ts      # User-specific data operations
├── services/                  # Business logic layer
│   ├── base/
│   │   └── BaseService.ts     # Service base class
│   ├── auth/
│   │   └── AuthService.ts     # Authentication & authorization
│   ├── booking/
│   │   └── BookingService.ts  # Booking business logic
│   ├── shared/
│   │   ├── CacheService.ts    # Redis caching service
│   │   └── LoggingService.ts  # Structured logging
│   └── ServiceContainer.ts    # Dependency injection container

src/app/api/v1/                # Versioned API endpoints
├── auth/
│   ├── login/route.ts         # User authentication
│   └── me/route.ts           # Current user info
├── bookings/route.ts         # Booking management
└── health/route.ts           # System health checks
```

## 🔧 Core Components

### 1. Service Layer Architecture

#### BaseService Class
All services extend the `BaseService` class which provides:
- Structured logging integration
- Caching helpers with TTL management
- Error handling with service-specific context
- Input validation with Zod schemas

```typescript
// Example service usage
export class BookingService extends BaseService {
  async createBooking(data: BookingCreateData): Promise<ServiceResponse<ExtendedBooking>> {
    const validatedData = this.validateInput(data, bookingCreateSchema);
    // Business logic here
  }
}
```

#### Service Container (Dependency Injection)
The `ServiceContainer` manages all service dependencies:

```typescript
const services = getServices();
const booking = await services.bookingService.createBooking(data);
const user = await services.authService.validateToken(token);
```

### 2. Repository Pattern

#### BaseRepository
Generic repository providing standard CRUD operations:
- Pagination support
- Performance monitoring
- Error handling
- Transaction support

```typescript
// Usage example
const userRepo = new UserRepository(db);
const users = await userRepo.findMany({
  where: { isActive: true },
  page: 1,
  limit: 10
});
```

### 3. Caching Strategy

#### Multi-Layer Caching
- **Redis Primary**: User sessions, pricing rules, frequently accessed data
- **Next.js Cache**: API responses, static data
- **Application Cache**: Service-level caching with TTL

```typescript
// Cache usage
const cached = await this.withCache(
  CacheKeys.user(userId),
  CacheTTL.MEDIUM,
  () => this.userRepository.findById(userId)
);
```

### 4. Authentication & Authorization

#### JWT-Based Authentication
- HTTP-only cookies for web clients
- Bearer tokens for API clients  
- Refresh token rotation
- Session management with Redis

#### Role-Based Authorization
```typescript
// Middleware usage
middleware.authorize(['ADMIN', 'CLIENT'])
```

### 5. API Middleware Stack

#### Request Processing Pipeline
1. **CORS**: Cross-origin request handling
2. **Rate Limiting**: Per-user and per-IP limits
3. **Authentication**: JWT validation
4. **Authorization**: Role-based access control
5. **Validation**: Request body/query validation
6. **Logging**: Request/response logging
7. **Security Headers**: Security header injection

## 🚀 Getting Started

### Environment Setup

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/crossborder"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""

# Authentication
JWT_SECRET="your-super-secret-jwt-key-32-chars-min"
JWT_REFRESH_SECRET="your-refresh-secret-key-32-chars-min"
NEXTAUTH_SECRET="your-nextauth-secret"

# Optional
GOOGLE_MAPS_API_KEY="your-google-maps-key"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-password"
```

### Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

### Redis Setup

```bash
# Install Redis (macOS)
brew install redis
brew services start redis

# Install Redis (Ubuntu)
sudo apt install redis-server
sudo systemctl start redis-server
```

### Development

```bash
# Start development server
npm run dev

# Check health
curl http://localhost:3000/api/v1/health

# Test authentication
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

## 📡 API Endpoints

### Authentication Endpoints

```
POST /api/v1/auth/login           # User login
POST /api/v1/auth/logout          # User logout
POST /api/v1/auth/refresh         # Refresh token
GET  /api/v1/auth/me              # Current user info
POST /api/v1/auth/change-password # Change password
```

### Booking Endpoints

```
POST /api/v1/bookings             # Create booking
GET  /api/v1/bookings             # List bookings (with pagination)
GET  /api/v1/bookings/:id         # Get booking details
PUT  /api/v1/bookings/:id         # Update booking
POST /api/v1/bookings/:id/assign  # Assign driver
POST /api/v1/bookings/:id/cancel  # Cancel booking
POST /api/v1/bookings/estimate    # Get price estimate
```

### System Endpoints

```
GET  /api/v1/health               # Health check
GET  /api/v1/metrics              # System metrics (admin only)
```

### API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "requestId": "req_123456789",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "version": "v1"
  }
}
```

## 🔒 Security Features

### Authentication Security
- JWT tokens with short expiration
- Refresh token rotation
- Rate limiting on login attempts
- Account lockout protection
- Session management

### API Security  
- Rate limiting per endpoint
- Request validation with Zod
- SQL injection prevention with Prisma
- CORS protection
- Security headers (CSP, XSS protection)
- Input sanitization

### Data Protection
- Password hashing with bcrypt
- Sensitive data encryption at rest
- Audit logging for admin actions
- Role-based access control
- Session timeout management

## 📊 Monitoring & Observability

### Structured Logging
- Request/response logging
- Database query monitoring
- Cache operation tracking
- Business event logging
- Error tracking with context

### Performance Monitoring
- API response times
- Database query performance
- Cache hit/miss ratios
- System resource usage

### Health Checks
```bash
# System health
GET /api/v1/health

# Response includes:
# - Database connectivity
# - Redis connectivity  
# - System resource usage
# - Service status
```

## 🚀 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis cluster configured
- [ ] SSL certificates installed
- [ ] Security headers configured
- [ ] Rate limiting configured
- [ ] Logging configured
- [ ] Health checks configured
- [ ] Monitoring setup

### Docker Support

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-Specific Configuration

```bash
# Development
NODE_ENV=development
LOG_LEVEL=debug
RATE_LIMIT_MAX_REQUESTS=1000

# Production  
NODE_ENV=production
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
```

## 🔧 Troubleshooting

### Common Issues

#### Cache Connection Issues
```bash
# Check Redis connection
redis-cli ping

# Clear cache
redis-cli flushall
```

#### Database Issues
```bash
# Check connection
npm run db:studio

# Reset database
npm run db:reset
```

#### Authentication Issues
```bash
# Check JWT secret length (min 32 chars)
echo $JWT_SECRET | wc -c

# Verify token
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/auth/me
```

### Debug Mode

Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

### Performance Debugging

Monitor slow queries:
```typescript
// Enable in development
const db = new PrismaClient({
  log: ['query', 'info', 'warn', 'error']
});
```

## 🎯 Next Steps

### Phase 2 Enhancements
- [ ] WebSocket implementation for real-time features
- [ ] Background job processing with Bull/BullMQ
- [ ] Advanced caching strategies
- [ ] Message queue integration
- [ ] API Gateway implementation

### Phase 3 Microservices
- [ ] Service separation by domain
- [ ] Event-driven architecture
- [ ] Service mesh implementation  
- [ ] Container orchestration
- [ ] Load balancing

### Phase 4 Advanced Features
- [ ] GraphQL API layer
- [ ] Real-time analytics
- [ ] Machine learning integration
- [ ] Global CDN integration
- [ ] Multi-region deployment

This architecture provides a solid foundation for scaling the Cross-Border Vehicles platform to handle enterprise-level traffic and complexity while maintaining security, performance, and maintainability.