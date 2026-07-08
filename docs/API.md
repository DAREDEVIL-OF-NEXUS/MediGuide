# MediGuide-AI — API Documentation

## Base URL
```
http://localhost:8000/api/v1
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## Auth Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "full_name": "Rishabh Goyal"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "Rishabh Goyal",
  "created_at": "2026-07-06T18:00:00Z"
}
```

### POST /auth/login
Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

### POST /auth/refresh
Refresh an expired access token.

**Request Body:**
```json
{
  "refresh_token": "eyJ..."
}
```

### GET /auth/me 🔒
Get current user profile.

### PUT /auth/me 🔒
Update current user profile.

---

## Prescription Endpoints

### POST /prescriptions/upload 🔒
Upload a prescription image for AI processing.

**Request:** `multipart/form-data`
- `file`: Image file (JPEG, PNG, WebP — max 10MB)
- `notes`: Optional text notes

**Response (201):**
```json
{
  "id": "uuid",
  "image_url": "https://...",
  "status": "processing",
  "created_at": "2026-07-06T18:00:00Z"
}
```

### GET /prescriptions 🔒
List user's prescriptions with pagination.

**Query Params:**
- `skip` (int, default 0)
- `limit` (int, default 20, max 100)

### GET /prescriptions/{id} 🔒
Get prescription details including extracted data.

### POST /prescriptions/{id}/reprocess 🔒
Re-run AI extraction on a prescription.

### DELETE /prescriptions/{id} 🔒
Delete a prescription and its associated data.

---

## Health Check

### GET /health
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

---

## Error Responses

All errors follow this format:
```json
{
  "detail": "Error message describing what went wrong"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request — Invalid input |
| 401 | Unauthorized — Missing or invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource doesn't exist |
| 422 | Validation Error — Schema validation failed |
| 429 | Too Many Requests — Rate limit exceeded |
| 500 | Internal Server Error |
