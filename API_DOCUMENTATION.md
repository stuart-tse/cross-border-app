# CrossBorder Vehicle Services - API Documentation

## Overview

This document describes the REST API endpoints for the CrossBorder Vehicle Services platform. The API supports multi-user authentication (Client, Driver, Blog Editor), booking management, driver verification, and blog/CMS functionality.

## Base URL
```
Development: http://localhost:3000/api
Production: https://crossborder-services.com/api
```

## Authentication

The API uses JWT tokens stored in HTTP-only cookies. Include the authentication token in requests via cookies.

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "userType": "CLIENT|DRIVER|BLOG_EDITOR",
  "phone": "+852-1234-5678"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com", 
  "password": "password123"
}
```

#### Logout
```http
POST /auth/logout
```

## User Types

### CLIENT
- Book vehicle services
- Manage trip history
- Leave reviews
- Update profile

### DRIVER  
- Upload verification documents
- Manage vehicle information
- Accept/manage bookings
- Update availability

### BLOG_EDITOR
- Create and edit blog posts
- Manage content
- Upload images
- SEO optimization

## Booking System

### Get Price Estimate
```http
POST /bookings/estimate
Content-Type: application/json

{
  "pickup": {
    "address": "Hong Kong International Airport",
    "lat": 22.3080,
    "lng": 113.9185,
    "type": "HK"
  },
  "dropoff": {
    "address": "Shenzhen Bao'an Airport",
    "lat": 22.6329,
    "lng": 113.8108,
    "type": "CHINA"
  },
  "vehicleType": "BUSINESS|EXECUTIVE|LUXURY|SUV|VAN"
}
```

Response:
```json
{
  "pricing": {
    "minPrice": 800,
    "maxPrice": 1200,
    "currency": "HKD",
    "priceRange": "HK$800 - HK$1200"
  },
  "journey": {
    "distance": 45.2,
    "estimatedDuration": 120,
    "isCrossBorder": true,
    "borderCrossingTime": 60
  },
  "breakdown": {
    "baseRate": "HK$12/km",
    "borderFee": "HK$200",
    "surcharges": "Peak hours +30%, Night +HK$100, Weekend +HK$50"
  }
}
```

### Create Booking
```http
POST /bookings
Content-Type: application/json
Authorization: Required (Client only)

{
  "pickupLocation": {
    "address": "Hong Kong International Airport",
    "lat": 22.3080,
    "lng": 113.9185,
    "type": "HK"
  },
  "dropoffLocation": {
    "address": "Shenzhen Bao'an Airport", 
    "lat": 22.6329,
    "lng": 113.8108,
    "type": "CHINA"
  },
  "scheduledDate": "2024-12-01T10:00:00Z",
  "vehicleType": "EXECUTIVE",
  "passengerCount": 2,
  "luggage": "2 large suitcases",
  "specialRequests": "Child seat required"
}
```

### Get User Bookings
```http
GET /bookings?page=1&limit=10&status=PENDING
Authorization: Required
```

## Maps & Location

### Search Locations
```http
GET /maps/search?q=airport&region=HK|CHINA|ALL
```

Response:
```json
{
  "suggestions": [
    {
      "id": "hk_001",
      "name": "Hong Kong International Airport",
      "address": "1 Sky Plaza Rd, Chek Lap Kok, Hong Kong",
      "district": "Islands",
      "region": "HK",
      "lat": 22.3080,
      "lng": 113.9185,
      "type": "airport",
      "icon": "✈️"
    }
  ],
  "count": 1
}
```

## Driver Verification

### Get Verification Status
```http
GET /drivers/verification
Authorization: Required (Driver only)
```

Response:
```json
{
  "profile": {
    "id": "driver_123",
    "isApproved": false,
    "licenseNumber": "DL123456",
    "rating": 4.8,
    "totalTrips": 150
  },
  "documents": {
    "DRIVING_LICENSE": [
      {
        "id": "doc_123",
        "status": "APPROVED",
        "uploadedAt": "2024-01-15T10:00:00Z"
      }
    ]
  },
  "verificationStatus": {
    "isComplete": false,
    "completedDocs": 3,
    "totalRequired": 5,
    "missingDocs": ["INSURANCE_HK", "INSURANCE_CHINA"],
    "pendingDocs": ["VEHICLE_REGISTRATION"],
    "approvedDocs": ["DRIVING_LICENSE", "ID_CARD", "PASSPORT"]
  }
}
```

### Upload Verification Document
```http
POST /drivers/verification
Content-Type: application/json
Authorization: Required (Driver only)

{
  "documentType": "DRIVING_LICENSE|VEHICLE_REGISTRATION|INSURANCE_HK|INSURANCE_CHINA|PASSPORT|ID_CARD|BUSINESS_LICENSE",
  "fileUrl": "/uploads/verification/doc123.jpg",
  "fileName": "license_front.jpg",
  "fileSize": 2048576,
  "mimeType": "image/jpeg",
  "expiryDate": "2025-12-31T23:59:59Z"
}
```

## Blog & CMS

### Get Blog Posts
```http
GET /blog/posts?page=1&limit=10&status=PUBLISHED&category=travel&search=hong kong
```

### Create Blog Post
```http
POST /blog/posts
Content-Type: application/json
Authorization: Required (Blog Editor only)

{
  "title": "The Ultimate Guide to Cross-Border Travel",
  "slug": "ultimate-guide-cross-border-travel",
  "excerpt": "Everything you need to know about traveling between Hong Kong and China",
  "content": "Full article content in markdown or HTML",
  "featuredImage": "/uploads/blog/featured-image.jpg",
  "metaTitle": "Cross-Border Travel Guide | CrossBorder Services",
  "metaDescription": "Complete guide to seamless travel between Hong Kong and Mainland China",
  "keywords": ["cross-border", "travel", "hong kong", "china"],
  "status": "DRAFT|PUBLISHED|SCHEDULED",
  "scheduledAt": "2024-12-01T09:00:00Z",
  "categoryIds": ["cat_123"],
  "tagIds": ["tag_456", "tag_789"]
}
```

## File Upload

### Upload File
```http
POST /uploads
Content-Type: multipart/form-data
Authorization: Required

FormData:
- file: (binary file)
- type: "verification|avatar|blog"
```

Response:
```json
{
  "success": true,
  "file": {
    "name": "1703123456-abc123.jpg",
    "originalName": "document.jpg",
    "size": 2048576,
    "type": "image/jpeg", 
    "url": "/uploads/verification/1703123456-abc123.jpg",
    "uploadedAt": "2024-01-15T10:00:00Z"
  }
}
```

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details (validation errors, etc.)",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation failed
- `500 Internal Server Error` - Server error

## Rate Limiting

- **Rate Limit**: 100 requests per 15-minute window per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Development Testing

### Using cURL

```bash
# Register new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User","userType":"CLIENT"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

# Get bookings (using saved cookies)
curl -X GET http://localhost:3000/api/bookings \
  -b cookies.txt
```

### Postman Collection

Import the following collection for comprehensive API testing:

```json
{
  "info": {
    "name": "CrossBorder Services API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [{"key": "token", "value": "{{jwt_token}}", "type": "string"}]
  }
}
```

## Database Schema

The API uses PostgreSQL with Prisma ORM. Key entities:

- **Users** - Multi-type user system (Client/Driver/BlogEditor)
- **Bookings** - Trip reservations and management
- **Vehicles** - Driver vehicle information
- **DriverVerificationDoc** - Document verification system
- **BlogPost** - CMS content management
- **Payments** - Transaction processing
- **Reviews** - Rating and feedback system
- **Notifications** - Real-time messaging

## Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcrypt with salt rounds
- **Input Validation** - Zod schema validation
- **File Upload Security** - Type and size validation
- **SQL Injection Prevention** - Prisma ORM protection
- **CORS Configuration** - Cross-origin request handling
- **Rate Limiting** - DDoS protection
- **Environment Variables** - Secure configuration management