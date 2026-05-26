# API Documentation

## Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:5001/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123",
  "name": "John Doe",
  "role": "client"
}
```

**Validation:**
- Email: Valid email format, lowercase
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Name: 2-100 characters
- Role: "client" or "admin" (defaults to "client")

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "client",
    "token": "jwt-token"
  }
}
```

**Errors:**
- 400: Validation error
- 409: Email already exists

---

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "client",
    "token": "jwt-token"
  }
}
```

**Errors:**
- 400: Validation error
- 401: Invalid credentials
- 429: Too many attempts (rate limited)

---

## Client Management

### GET /clients
Get list of all clients (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "clients": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "created_at": "2026-02-15T10:00:00Z",
      "has_intake": true,
      "has_meal_plan": false
    }
  ]
}
```

**Errors:**
- 401: Not authenticated
- 403: Not admin

---

### GET /clients/:userId
Get specific client details (Admin or own profile).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "client": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "(555) 123-4567",
    "created_at": "2026-02-15T10:00:00Z",
    "intake_data": {
      "weight": 75,
      "height": 175,
      "age": 30,
      "gender": "male",
      "activity": "moderate",
      "goal": "weight-loss",
      "bmi": 24.5,
      "bmr": 1650,
      "tdee": 2558
    }
  }
}
```

**Errors:**
- 401: Not authenticated
- 403: Not authorized
- 404: Client not found

---

### POST /clients/:userId/intake
Save or update client intake data.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "weight": 75,
  "height": 175,
  "age": 30,
  "gender": "male",
  "activity": "moderate",
  "goal": "weight-loss",
  "goal_weight": 70,
  "dietary_restrictions": "vegetarian",
  "allergies": "nuts",
  "medical_conditions": "none",
  "medications": "none",
  "sleep_hours": 7,
  "stress_level": "moderate",
  "water_intake": 2.5,
  "meals_per_day": 3,
  "smoking": "no",
  "alcohol": "occasionally"
}
```

**Validation:**
- Weight: 20-500 kg
- Height: 50-300 cm
- Age: 13-120 years
- Gender: "male", "female", "other"
- Activity: "sedentary", "light", "moderate", "active", "very_active"
- Goal: "lose", "maintain", "gain", "muscle-gain", "athletic"

**Response (200):**
```json
{
  "success": true,
  "message": "Intake data saved successfully",
  "calculations": {
    "bmi": 24.5,
    "bmr": 1650,
    "tdee": 2558,
    "target_calories": 2058
  }
}
```

**Errors:**
- 400: Validation error
- 401: Not authenticated
- 403: Not authorized

---

### DELETE /clients/:userId
Delete a client account (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Client deleted successfully"
}
```

**Errors:**
- 401: Not authenticated
- 403: Not admin
- 404: Client not found

---

## Weight Tracking

### POST /clients/:userId/weight
Log weight entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "weight": 74.5,
  "date": "2026-02-15",
  "notes": "Feeling good"
}
```

**Response (201):**
```json
{
  "success": true,
  "entry": {
    "id": "uuid",
    "weight": 74.5,
    "bmi": 24.3,
    "date": "2026-02-15",
    "notes": "Feeling good"
  }
}
```

---

### GET /clients/:userId/weight
Get weight history.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "history": [
    {
      "id": "uuid",
      "weight": 74.5,
      "bmi": 24.3,
      "date": "2026-02-15",
      "notes": "Feeling good"
    }
  ]
}
```

---

## Meal Plans

### GET /clients/:userId/meal-plan
Get client's meal plan.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "meal_plan": {
    "id": "uuid",
    "target_calories": 2058,
    "protein": 154,
    "carbs": 206,
    "fats": 68,
    "meals": {
      "breakfast": [...],
      "lunch": [...],
      "dinner": [...],
      "snacks": [...]
    },
    "created_at": "2026-02-15T10:00:00Z"
  }
}
```

---

### POST /clients/:userId/meal-plan
Create or update meal plan (Admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "target_calories": 2058,
  "meals": {
    "breakfast": ["Oatmeal", "Banana"],
    "lunch": ["Grilled Chicken", "Rice"],
    "dinner": ["Salmon", "Vegetables"],
    "snacks": ["Almonds", "Apple"]
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Meal plan created successfully"
}
```

---

## Appointments

### GET /appointments
Get appointments (filtered by role).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: "pending", "confirmed", "completed", "cancelled"
- `date`: Filter by specific date (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "appointments": [
    {
      "id": "uuid",
      "client_id": "uuid",
      "client_name": "John Doe",
      "appointment_date": "2026-02-20T14:00:00Z",
      "duration": 60,
      "type": "consultation",
      "status": "confirmed",
      "notes": "Initial consultation"
    }
  ]
}
```

---

### POST /appointments
Create new appointment.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "client_id": "uuid",
  "appointment_date": "2026-02-20T14:00:00Z",
  "duration": 60,
  "type": "consultation",
  "notes": "Initial consultation"
}
```

**Response (201):**
```json
{
  "success": true,
  "appointment": {
    "id": "uuid",
    "appointment_date": "2026-02-20T14:00:00Z",
    "status": "pending"
  }
}
```

---

### PATCH /appointments/:id
Update appointment status.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Appointment updated successfully"
}
```

---

## Analytics (Admin Only)

### GET /analytics/summary
Get analytics summary.

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response (200):**
```json
{
  "success": true,
  "summary": {
    "totalClients": 45,
    "activeClients": 38,
    "completedIntake": 42,
    "withMealPlans": 35,
    "pendingAppointments": 12,
    "completedAppointments": 156
  }
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "requestId": "uuid"
}
```

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Not authenticated
- `AUTHORIZATION_ERROR` - Not authorized
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict (e.g., duplicate email)
- `RATE_LIMIT_ERROR` - Too many requests
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

### General API
- 100 requests per 15 minutes per IP

### Authentication Endpoints
- 5 requests per 15 minutes per IP

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1645012800
```

**Rate Limit Error (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_ERROR",
    "message": "Too many requests, please try again later"
  }
}
```

---

## Request ID Tracking

All responses include a unique request ID for debugging:

**Header:**
```
X-Request-ID: uuid
```

**In Error Response:**
```json
{
  "requestId": "uuid"
}
```

Use this ID when reporting issues.
