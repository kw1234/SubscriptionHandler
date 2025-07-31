# API Documentation

This document provides comprehensive documentation for the Subscription Management Dashboard API endpoints.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Dashboard Endpoints](#dashboard-endpoints)
- [Subscription Management](#subscription-management)
- [Activity Logging](#activity-logging)
- [Payment Processing](#payment-processing)
- [WebSocket Events](#websocket-events)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## 🔐 Authentication

The API uses session-based authentication. All endpoints except health checks require authentication.

### Session Management
- Sessions are managed server-side with PostgreSQL storage
- Session cookies are httpOnly and secure in production
- Session timeout: 24 hours

## 📊 Dashboard Endpoints

### Get Dashboard Metrics
```http
GET /api/dashboard/metrics
```

Returns real-time business metrics for the dashboard.

**Response:**
```json
{
  "activeCount": 150,
  "pendingCount": 25,
  "inactiveCount": 75,
  "dailyRevenue": 4500.00,
  "successCount": 142,
  "failureCount": 8,
  "revenueToday": 1200.00,
  "revenueYesterday": 980.00,
  "paymentSuccessRate": 94.7
}
```

**Response Fields:**
- `activeCount` - Number of active subscriptions
- `pendingCount` - Number of subscriptions in pending_off state
- `inactiveCount` - Number of inactive subscriptions
- `dailyRevenue` - Total daily revenue
- `successCount` - Successful payments today
- `failureCount` - Failed payments today
- `revenueToday` - Revenue for current day
- `revenueYesterday` - Revenue for previous day
- `paymentSuccessRate` - Success rate percentage

## 🔄 Subscription Management

### List Subscriptions
```http
GET /api/subscriptions?page=1&limit=10&status=all
```

Returns paginated list of subscriptions with user details.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `status` (optional) - Filter by status: `active`, `pending_off`, `inactive`, `all` (default: all)

**Response:**
```json
{
  "subscriptions": [
    {
      "id": 1,
      "userId": 123,
      "status": "active",
      "nextRenewal": "2025-01-01T12:00:00Z",
      "createdAt": "2024-12-01T12:00:00Z",
      "updatedAt": "2024-12-31T12:00:00Z",
      "user": {
        "id": 123,
        "username": "john_doe",
        "email": "john@example.com"
      }
    }
  ],
  "total": 250,
  "page": 1,
  "limit": 10
}
```

### Create Subscription
```http
POST /api/subscriptions
```

Creates a new subscription for the authenticated user.

**Request Body:**
```json
{
  "paymentMethodId": "pm_1234567890"
}
```

**Response:**
```json
{
  "id": 1,
  "userId": 123,
  "status": "active",
  "nextRenewal": "2025-01-01T12:00:00Z",
  "createdAt": "2024-12-31T12:00:00Z",
  "updatedAt": "2024-12-31T12:00:00Z"
}
```

### Toggle Subscription
```http
PUT /api/subscriptions/:id/toggle
```

Toggles subscription between active and pending_off states.

**Path Parameters:**
- `id` - Subscription ID

**Response:**
```json
{
  "id": 1,
  "userId": 123,
  "status": "pending_off",
  "nextRenewal": "2025-01-01T12:00:00Z",
  "updatedAt": "2024-12-31T12:00:00Z"
}
```

**Business Logic:**
- `active` → `pending_off`: User remains active until next renewal
- `pending_off` → `active`: Subscription reactivated
- `inactive` → `active`: New renewal cycle starts

## 📝 Activity Logging

### Get Activity Logs
```http
GET /api/activity-logs?page=1&limit=10
```

Returns paginated activity logs with user context.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Response:**
```json
{
  "activities": [
    {
      "id": 1,
      "userId": 123,
      "action": "subscription_created",
      "description": "New subscription created",
      "createdAt": "2024-12-31T12:00:00Z",
      "user": {
        "id": 123,
        "username": "john_doe"
      }
    }
  ],
  "total": 500,
  "page": 1,
  "limit": 10
}
```

**Activity Types:**
- `subscription_created` - New subscription
- `subscription_renewed` - Successful renewal
- `subscription_cancelled` - User cancellation
- `subscription_reactivated` - User reactivation
- `payment_succeeded` - Successful payment
- `payment_failed` - Failed payment
- `payment_retried` - Payment retry attempt

## 💳 Payment Processing

### Get Payment History
```http
GET /api/payment-history?page=1&limit=10
```

Returns paginated payment transaction history.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)

**Response:**
```json
{
  "payments": [
    {
      "id": 1,
      "subscriptionId": 1,
      "amount": 29.99,
      "currency": "usd",
      "status": "succeeded",
      "paymentMethodId": "pm_1234567890",
      "failureReason": null,
      "createdAt": "2024-12-31T12:00:00Z",
      "subscription": {
        "id": 1,
        "userId": 123
      }
    }
  ],
  "total": 1000,
  "page": 1,
  "limit": 10
}
```

**Payment Statuses:**
- `succeeded` - Payment completed successfully
- `failed` - Payment failed
- `pending` - Payment processing
- `refunded` - Payment was refunded

### Process Payment (Mock)
```http
POST /api/process-payment
```

Processes a mock payment for development/testing.

**Request Body:**
```json
{
  "subscriptionId": 1,
  "amount": 29.99,
  "paymentMethodId": "pm_test_card"
}
```

**Response:**
```json
{
  "id": 1,
  "status": "succeeded",
  "amount": 29.99,
  "currency": "usd"
}
```

**Mock Behavior:**
- 90% success rate for testing
- Random failures simulate real-world scenarios
- Immediate response (no actual payment processing)

## 🔌 WebSocket Events

The application uses WebSocket for real-time updates on `/ws` path.

### Connection
```javascript
const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const wsUrl = `${protocol}//${window.location.host}/ws`;
const socket = new WebSocket(wsUrl);
```

### Events Broadcasted

#### Metrics Update
```json
{
  "type": "metrics_updated",
  "data": {
    "activeCount": 150,
    "pendingCount": 25,
    "dailyRevenue": 4500.00
  }
}
```

#### Subscription Update
```json
{
  "type": "subscription_updated", 
  "data": {
    "subscriptionId": 1,
    "status": "active",
    "userId": 123
  }
}
```

#### Activity Update
```json
{
  "type": "activity_logged",
  "data": {
    "action": "subscription_created",
    "userId": 123,
    "description": "New subscription created"
  }
}
```

#### Payment Update
```json
{
  "type": "payment_processed",
  "data": {
    "paymentId": 1,
    "subscriptionId": 1,
    "status": "succeeded",
    "amount": 29.99
  }
}
```

## ❌ Error Handling

### Standard Error Response
```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

### Common Error Codes

#### Authentication Errors
```json
{
  "error": "Authentication required",
  "code": "AUTH_REQUIRED"
}
```

#### Validation Errors
```json
{
  "error": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

#### Business Logic Errors
```json
{
  "error": "Subscription already exists",
  "code": "SUBSCRIPTION_EXISTS"
}
```

#### Rate Limiting
```json
{
  "error": "Too many requests",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "retryAfter": 60
  }
}
```

## 🚦 Rate Limiting

### Default Limits
- **Dashboard endpoints**: 100 requests per minute
- **Subscription operations**: 20 requests per minute
- **Payment processing**: 10 requests per minute
- **WebSocket connections**: 5 per IP address

### Headers
Rate limiting information is included in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔍 Health Checks

### Application Health
```http
GET /health
```

Basic health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-12-31T12:00:00Z"
}
```

### API Health
```http
GET /api/health
```

Comprehensive health check including database connectivity.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "websocket": "active",
  "timestamp": "2024-12-31T12:00:00Z",
  "uptime": 86400
}
```

## 📋 Data Types

### Subscription Status
- `active` - Subscription is active and will auto-renew
- `pending_off` - User requested cancellation, active until expiry
- `inactive` - Subscription expired or cancelled

### Payment Status
- `succeeded` - Payment completed successfully
- `failed` - Payment failed
- `pending` - Payment being processed
- `refunded` - Payment was refunded

### Activity Actions
- `subscription_created`
- `subscription_renewed`
- `subscription_cancelled`
- `subscription_reactivated`
- `payment_succeeded`
- `payment_failed`
- `payment_retried`

## 🔐 Security Considerations

### Authentication
- Session-based authentication with secure cookies
- CSRF protection enabled
- Session timeout after 24 hours

### Data Protection
- All sensitive data encrypted in transit
- Database credentials never exposed in responses
- Payment information handled securely

### Input Validation
- All request bodies validated using Zod schemas
- SQL injection protection via Drizzle ORM
- XSS protection with proper escaping

## 📈 Performance

### Caching
- Database query results cached where appropriate
- Static assets served with proper cache headers
- WebSocket connections pooled efficiently

### Optimization
- Database indexes on frequently queried columns
- Connection pooling for database operations
- Efficient pagination for large datasets

---

For additional support or questions about the API, please refer to the main documentation or contact the development team.