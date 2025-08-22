# Enterprise API Documentation

## 🚀 Overview

This document describes the enterprise-grade API system for the Cross-Border Vehicles platform. All APIs follow RESTful conventions, implement comprehensive security measures, and provide consistent response formats.

## 🔐 Security Standards

### Authentication
- **JWT Tokens**: Access tokens with 24-hour expiration
- **Refresh Tokens**: 30-day expiration with rotation
- **HTTP-Only Cookies**: Secure cookie-based authentication
- **Bearer Tokens**: Authorization header support for API clients

### Authorization  
- **Role-Based Access Control (RBAC)**: CLIENT, DRIVER, BLOG_EDITOR, ADMIN roles
- **Permission System**: Granular permissions within roles
- **Route Protection**: Middleware-enforced authorization

### Security Measures
- **Rate Limiting**: Per-user and per-IP request limits
- **Input Validation**: Zod schema validation for all endpoints
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: Content Security Policy headers
- **CORS Protection**: Configurable cross-origin policies

## 📊 Response Format

All APIs return standardized JSON responses:

```json
{
  "success": boolean,
  "data": {
    // Response data
  },
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Additional error details
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

## 🔑 Authentication Endpoints

### POST `/api/v1/auth/login`
**Description**: User authentication with email/password  
**Authorization**: None required  
**Rate Limit**: 5 requests/15 minutes per IP  

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "remember": false
}
```

**Response**: User object with authentication tokens set as HTTP-only cookies

### POST `/api/v1/auth/logout`
**Description**: Invalidate user session  
**Authorization**: JWT token required  

**Response**: Success confirmation with cleared cookies

### POST `/api/v1/auth/refresh`
**Description**: Refresh access token using refresh token  
**Authorization**: Refresh token (cookie or body)  

**Response**: New access token with updated expiration

### GET `/api/v1/auth/me`
**Description**: Get current user information  
**Authorization**: JWT token required  

**Response**: Current user profile with roles and permissions

### POST `/api/v1/auth/register`
**Description**: Register new user account  
**Authorization**: None required  
**Rate Limit**: 3 requests/hour per IP  

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "name": "John Doe",
  "password": "SecurePassword123!",
  "phone": "+1234567890",
  "userType": "CLIENT"
}
```

### POST `/api/v1/auth/change-password`
**Description**: Change user password  
**Authorization**: JWT token required  

**Request Body**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

## 👥 Client Endpoints

### GET `/api/v1/clients/profile`
**Description**: Get client profile with stats  
**Authorization**: CLIENT role required  

**Response**: Complete client profile including booking stats, payment methods, and settings

### PUT `/api/v1/clients/profile`
**Description**: Update client profile  
**Authorization**: CLIENT role required  

**Request Body**:
```json
{
  "name": "Updated Name",
  "phone": "+1234567890",
  "preferredVehicle": "LUXURY",
  "emergencyContact": "Jane Doe",
  "emergencyContactPhone": "+0987654321",
  "emergencyContactRelation": "Spouse"
}
```

### GET `/api/v1/clients/bookings`
**Description**: Get client booking history with filtering  
**Authorization**: CLIENT role required  

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Results per page (default: 10)
- `status`: Filter by booking status
- `fromDate`: Filter bookings from date
- `toDate`: Filter bookings to date
- `sortBy`: Sort field (scheduledDate, createdAt, status)
- `sortOrder`: Sort order (asc, desc)

**Response**: Paginated booking list with driver, vehicle, and payment details

## 🚗 Driver Endpoints

### GET `/api/v1/drivers/vehicles`
**Description**: Get driver's vehicles with document alerts  
**Authorization**: DRIVER role required  

**Query Parameters**:
- `page`: Page number
- `limit`: Results per page
- `isActive`: Filter active vehicles

**Response**: Vehicle list with permits, licenses, and expiry alerts

### POST `/api/v1/drivers/vehicles`
**Description**: Add new vehicle to driver fleet  
**Authorization**: DRIVER role required (approved drivers only)  

**Request Body**:
```json
{
  "make": "Toyota",
  "model": "Camry",
  "year": 2022,
  "color": "White",
  "plateNumber": "ABC123",
  "vehicleType": "BUSINESS",
  "capacity": 4,
  "features": ["GPS", "WiFi", "AC"],
  "fuelType": "GAS",
  "insuranceExpiry": "2025-12-31T23:59:59.000Z",
  "inspectionExpiry": "2025-06-30T23:59:59.000Z",
  "photos": ["https://example.com/photo1.jpg"]
}
```

## ✏️ Editor Endpoints

### GET `/api/v1/editor/posts`
**Description**: Get blog posts for editing  
**Authorization**: BLOG_EDITOR or ADMIN role required  

**Query Parameters**:
- `page`: Page number
- `limit`: Results per page
- `status`: Filter by post status
- `search`: Search in title/content
- `categoryId`: Filter by category
- `sortBy`: Sort field

**Response**: Blog posts with SEO scores and analytics

### POST `/api/v1/editor/posts`
**Description**: Create new blog post  
**Authorization**: BLOG_EDITOR or ADMIN role required  

**Request Body**:
```json
{
  "title": "Cross-Border Travel Tips",
  "slug": "cross-border-travel-tips",
  "excerpt": "Essential tips for cross-border vehicle travel",
  "content": "<p>Detailed blog post content...</p>",
  "featuredImage": "https://example.com/image.jpg",
  "metaTitle": "Cross-Border Travel Tips | CBV Blog",
  "metaDescription": "Learn essential tips for safe cross-border travel",
  "keywords": ["travel", "cross-border", "vehicle"],
  "status": "DRAFT",
  "categoryIds": ["cat_123"],
  "tagIds": ["tag_456"]
}
```

## 👨‍💼 Admin Endpoints

### GET `/api/v1/admin/users`
**Description**: Get system users with advanced filtering  
**Authorization**: ADMIN role required  
**Rate Limit**: 1000 requests/15 minutes  

**Query Parameters**:
- `page`: Page number
- `limit`: Results per page
- `search`: Search users by name/email/phone
- `userType`: Filter by user role
- `isActive`: Filter by active status
- `isVerified`: Filter by verification status
- `sortBy`: Sort field
- `sortOrder`: Sort order

**Response**: User list with role details, profiles, and statistics

### POST `/api/v1/admin/users`
**Description**: Bulk user management operations  
**Authorization**: ADMIN role required  
**Rate Limit**: 100 requests/hour  

**Request Body**:
```json
{
  "action": "assign_role",
  "userIds": ["user_123", "user_456"],
  "role": "DRIVER"
}
```

**Available Actions**:
- `activate`: Activate user accounts
- `deactivate`: Deactivate user accounts  
- `verify`: Mark users as verified
- `assign_role`: Assign role to users
- `revoke_role`: Revoke role from users

## 📊 System Endpoints

### GET `/api/v1/health`
**Description**: System health check  
**Authorization**: None required  

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "database": {
        "status": "connected",
        "healthy": true
      },
      "cache": {
        "status": "connected", 
        "healthy": true
      }
    },
    "system": {
      "uptime": 86400,
      "memory": {
        "used": 128,
        "total": 512,
        "rss": 256
      },
      "nodeVersion": "v18.17.0",
      "environment": "production"
    }
  }
}
```

## ⚡ Performance Features

### Caching Strategy
- **Redis Caching**: User sessions, pricing rules, frequently accessed data
- **Application Caching**: Service-level caching with TTL
- **Smart Invalidation**: Cache invalidation on data updates

### Rate Limiting
- **Per-User Limits**: Authenticated users get higher limits
- **Per-IP Limits**: Protect against abuse from single IPs
- **Endpoint-Specific**: Different limits for different operations
- **Sliding Window**: Fair usage across time periods

### Database Optimization
- **Connection Pooling**: Efficient database connection management
- **Query Optimization**: Indexed queries for common operations
- **Pagination**: Consistent pagination across all list endpoints
- **Eager Loading**: Efficient data fetching with includes

## 🛡️ Error Handling

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "requestId": "req_123456789",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "version": "v1"
  }
}
```

## 🚀 Getting Started

### Authentication Flow
1. **Register/Login**: Use `/api/v1/auth/login` or `/api/v1/auth/register`
2. **Store Tokens**: Tokens are set as HTTP-only cookies automatically
3. **Make Requests**: Include cookies or Authorization header
4. **Handle Refresh**: Use `/api/v1/auth/refresh` for token renewal

### Example API Usage

```javascript
// Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  }),
  credentials: 'include' // Include cookies
});

// Make authenticated request
const profileResponse = await fetch('/api/v1/clients/profile', {
  credentials: 'include' // Include cookies
});

// Or with Authorization header
const profileResponse = await fetch('/api/v1/clients/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
```

### Rate Limit Headers
Responses include rate limit information:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

## 🔧 Migration from Legacy APIs

### Deprecated Endpoints
The following legacy endpoints have been disabled and should not be used:

- `/api/admin/*` → Use `/api/v1/admin/*`
- `/api/client/*` → Use `/api/v1/clients/*`
- `/api/drivers/*` → Use `/api/v1/drivers/*`
- `/api/blog/*` → Use `/api/v1/editor/*`
- `/api/bookings/*` → Use `/api/v1/bookings/*`

### Migration Steps
1. **Update API Endpoints**: Change all API calls to use `/api/v1/` prefix
2. **Update Response Handling**: Adapt to new standardized response format
3. **Update Authentication**: Ensure proper JWT token handling
4. **Test Thoroughly**: Validate all functionality with new endpoints

## 📈 Monitoring and Analytics

### Request Logging
All API requests are logged with:
- Request ID for tracing
- User ID for audit trails
- Performance metrics
- Error details
- Security events

### Performance Monitoring
- Response times tracked per endpoint
- Database query performance
- Cache hit/miss ratios
- Rate limit violations
- Error rates by endpoint

This enterprise API system provides a solid foundation for scaling the Cross-Border Vehicles platform while maintaining security, performance, and reliability standards.