# Cough Sense Backend API Endpoints

This document outlines all the API endpoints required for the Cough Sense application backend.

## Base URL
```
https://api.coughsense.com/api
```

---

## Authentication Endpoints

### 1. Register (Signup)
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "string",
    "email": "string"
  },
  "token": "string"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `409 Conflict` - Email already exists

---

### 2. Login
**POST** `/auth/login`

Authenticate a user and receive an access token.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "string",
    "email": "string"
  },
  "token": "string"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing required fields

---

### 3. Logout
**POST** `/auth/logout`

Invalidate the current user session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

### 4. Get Current User
**GET** `/auth/me`

Retrieve the currently authenticated user's information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "string",
    "email": "string"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

## Cough Analysis Endpoints

### 5. Analyze Cough
**POST** `/analysis/analyze`

Upload a cough audio sample and symptoms for AI analysis.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
audioFile: File (audio/wav, audio/mpeg)
symptoms: JSON string
```

**Symptoms JSON Structure:**
```json
{
  "fever": "boolean",
  "shortnessOfBreath": "boolean",
  "soreThroat": "boolean",
  "runnyNose": "boolean",
  "chestPain": "boolean",
  "fatigue": "boolean",
  "lossOfTasteSmell": "boolean",
  "muscleAches": "boolean"
}
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "condition": "string",
  "severity": "Low" | "Moderate" | "High",
  "confidence": 68,
  "recommendations": [
    "Rest and stay hydrated",
    "Monitor for shortness of breath or high fever (>102°F)",
    "Isolate from others if you suspect a viral infection",
    "Consult a healthcare professional if symptoms worsen"
  ],
  "detailedAnalysis": {
    "audioFeatures": {
      "frequency": "number",
      "duration": "number",
      "intensity": "number"
    },
    "symptomCorrelation": {
      "primarySymptoms": ["string"],
      "severity": "string"
    }
  },
  "createdAt": "2025-12-29T10:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid audio file or missing data
- `401 Unauthorized` - Missing or invalid token
- `413 Payload Too Large` - Audio file exceeds size limit
- `415 Unsupported Media Type` - Invalid audio format

---

### 6. Get Assessment History
**GET** `/analysis/history`

Retrieve the user's past cough assessments.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 10, max: 50)

**Response:** `200 OK`
```json
{
  "assessments": [
    {
      "id": "string",
      "date": "2025-12-29T10:30:00Z",
      "condition": "Potential Acute Bronchitis",
      "severity": "Moderate",
      "confidence": 68
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

### 7. Get Assessment Details
**GET** `/analysis/:id`

Retrieve detailed information about a specific assessment.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "date": "2025-12-29T10:30:00Z",
  "condition": "Potential Acute Bronchitis",
  "severity": "Moderate",
  "confidence": 68,
  "recommendations": [
    "Rest and stay hydrated",
    "Schedule a non-urgent telehealth appointment"
  ],
  "symptoms": {
    "fever": true,
    "shortnessOfBreath": false,
    "soreThroat": true,
    "runnyNose": false,
    "chestPain": false,
    "fatigue": true,
    "lossOfTasteSmell": false,
    "muscleAches": true
  },
  "detailedAnalysis": {
    "audioFeatures": {
      "frequency": 250,
      "duration": 5.2,
      "intensity": 72
    },
    "symptomCorrelation": {
      "primarySymptoms": ["fever", "fatigue"],
      "severity": "moderate"
    }
  },
  "audioUrl": "https://storage.example.com/audio/abc123.wav"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Assessment belongs to another user
- `404 Not Found` - Assessment not found

---

### 8. Delete Assessment
**DELETE** `/analysis/:id`

Delete a specific assessment from history.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "message": "Assessment deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Assessment belongs to another user
- `404 Not Found` - Assessment not found

---

## User Profile Endpoints

### 9. Get User Profile
**GET** `/user/profile`

Retrieve the current user's account information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "string",
  "email": "john.doe@example.com",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-12-29T10:30:00Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

### 10. Update User Profile
**PUT** `/user/profile`

Update the current user's account information.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string" (optional - only if changing password)
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "string",
    "email": "john.doe@example.com"
  },
  "message": "Profile updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Invalid or missing token
- `409 Conflict` - Email already in use

---

---


---

## Technical Requirements

### Authentication
- Use JWT (JSON Web Tokens) for authentication
- Token expiration: 24 hours (recommended)
- Refresh token mechanism (optional but recommended)

### File Upload
- Supported audio formats: WAV, MP3, M4A
- Maximum file size: 10 MB
- Audio duration: 2-30 seconds recommended

### Rate Limiting
- Authentication endpoints: 5 requests per minute per IP
- Analysis endpoint: 10 requests per hour per user
- Other endpoints: 60 requests per minute per user

### Database Models

#### Users Table
```sql
- id: UUID (primary key)
- email: VARCHAR(255) (unique, indexed)
- password_hash: VARCHAR(255)
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### Assessments Table
```sql
- id: UUID (primary key)
- user_id: UUID (foreign key)
- audio_url: VARCHAR(500)
- condition: VARCHAR(255)
- severity: ENUM('Low', 'Moderate', 'High')
- confidence: INTEGER (0-100)
- symptoms: JSON
- recommendations: JSON
- detailed_analysis: JSON
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

### CORS Configuration
Enable CORS for:
- Development: `http://localhost:3000`
- Production: `https://coughsense.com`

### Environment Variables
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/coughsense
JWT_SECRET=your_secret_key_here
JWT_EXPIRATION=24h
AWS_S3_BUCKET=coughsense-audio
AWS_REGION=us-east-1
ML_MODEL_ENDPOINT=https://ml-api.example.com
PORT=8000
NODE_ENV=development
```

---

## Implementation Priority

### Phase 1 (Core Triage Features) ✅
1. ✅ Authentication endpoints (register, login, logout, me)
2. ✅ Analyze cough endpoint
3. ✅ Get assessment history
4. ✅ Get assessment details
5. ✅ Delete assessment

### Phase 2 (Account Management) ✅
6. ✅ Get user profile
7. ✅ Update user profile (email/password)

### ❌ Removed Features
- ~~Find nearby clinics~~ - Not part of triage tool
- ~~Schedule telehealth~~ - Not part of triage tool
- ~~Medical advice endpoint~~ - Not part of triage tool

---

## Notes

### ⚠️ Important Disclaimer
This API provides **triage-level risk assessment**, not medical diagnosis. All responses should include appropriate disclaimers and users should be advised to consult healthcare professionals.

### Technical Notes
- All timestamps should be in ISO 8601 format (UTC)
- All endpoints except authentication require a valid JWT token
- Audio files should be stored securely (AWS S3, Google Cloud Storage, etc.)
- Implement proper error handling and validation
- Log all API requests for debugging and monitoring
- Consider implementing request/response compression (gzip)
- Implement proper data encryption for sensitive information
- All assessment responses should include disclaimers about not being medical diagnoses
